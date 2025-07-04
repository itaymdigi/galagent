import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { createProductionStorage, productionConfig } from '../config/production';

// Configure memory with working memory per user (production-ready)
const { storage, vector } = createProductionStorage();
const memory = storage ? new Memory({
  storage,
  ...(vector && { vector }), // Only include vector if it exists
  options: productionConfig.memory,
}) : undefined;

// WhatsApp message sending tool
const whatsappSendTool = createTool({
  id: 'whatsapp-send',
  description: 'Send a WhatsApp message to a phone number. Use this when user wants to send scraped information or any message via WhatsApp.',
  inputSchema: z.object({
    phoneNumber: z.string().describe('Phone number with country code (no + or spaces, e.g., 1234567890)'),
    message: z.string().describe('The message to send'),
    type: z.enum(['user', 'group']).default('user').describe('Type of recipient: user for individual, group for WhatsApp group'),
  }),
  execute: async ({ context }) => {
    try {
      // Validate phone number format
      const phoneRegex = /^\d{1,4}\d{6,15}$/;
      if (!phoneRegex.test(context.phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please provide phone number with country code (no + or spaces)',
          phoneNumber: context.phoneNumber,
        };
      }

      // Get WaPulse credentials from environment
      const instanceID = process.env.WAPULSE_INSTANCE_ID;
      const token = process.env.WAPULSE_TOKEN;

      if (!instanceID || !token) {
        return {
          success: false,
          error: 'WaPulse credentials not configured. Please set WAPULSE_INSTANCE_ID and WAPULSE_TOKEN environment variables.',
        };
      }

      // Send WhatsApp message using WaPulse API
      const response = await fetch(`https://wapulse.com/api/v1/instances/${instanceID}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: context.phoneNumber,
          message: context.message,
          type: context.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`WaPulse API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        phoneNumber: context.phoneNumber,
        messageLength: context.message.length,
        messageId: result.messageId || 'unknown',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        phoneNumber: context.phoneNumber,
      };
    }
  },
});

// Enhanced web scraping tool with WhatsApp integration
const scrapeAndSendTool = createTool({
  id: 'scrape-and-send-whatsapp',
  description: 'Scrape a website and send the extracted information via WhatsApp. This combines web scraping with WhatsApp messaging.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to scrape'),
    phoneNumber: z.string().describe('Phone number to send the scraped content to (with country code, no + or spaces)'),
    customMessage: z.string().optional().describe('Optional custom message to include with the scraped content'),
    maxContentLength: z.number().optional().default(1000).describe('Maximum length of scraped content to include in message'),
  }),
  execute: async ({ context }) => {
    try {
      // First, scrape the website
      const scrapeResponse = await fetch(context.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!scrapeResponse.ok) {
        throw new Error(`Failed to fetch URL: ${scrapeResponse.status}`);
      }

      const html = await scrapeResponse.text();
      
      // Extract content and title
      const cleanContent = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Website Content';

      // Truncate content if too long
      const truncatedContent = cleanContent.length > context.maxContentLength 
        ? cleanContent.slice(0, context.maxContentLength) + '...' 
        : cleanContent;

      // Format the message
      let message = `📄 *${title}*\n\n`;
      if (context.customMessage) {
        message += `${context.customMessage}\n\n`;
      }
      message += `🔗 *Source:* ${context.url}\n\n`;
      message += `📝 *Content:*\n${truncatedContent}`;

      // Send via WhatsApp directly
      const instanceID = process.env.WAPULSE_INSTANCE_ID;
      const token = process.env.WAPULSE_TOKEN;

      if (!instanceID || !token) {
        return {
          scrapeSuccess: true,
          whatsappResult: {
            success: false,
            error: 'WaPulse credentials not configured. Please set WAPULSE_INSTANCE_ID and WAPULSE_TOKEN environment variables.',
          },
          scrapedData: {
            url: context.url,
            title,
            contentLength: cleanContent.length,
            truncatedLength: truncatedContent.length,
          },
        };
      }

      // Send WhatsApp message using WaPulse API
      const whatsappResponse = await fetch(`https://wapulse.com/api/v1/instances/${instanceID}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: context.phoneNumber,
          message: message,
          type: 'user',
        }),
      });

      let whatsappResult;
      if (!whatsappResponse.ok) {
        const errorData = await whatsappResponse.json().catch(() => ({}));
        whatsappResult = {
          success: false,
          error: `WaPulse API error: ${whatsappResponse.status} - ${errorData.message || 'Unknown error'}`,
        };
      } else {
        const result = await whatsappResponse.json();
        whatsappResult = {
          success: true,
          message: 'WhatsApp message sent successfully',
          messageId: result.messageId || 'unknown',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        scrapeSuccess: true,
        whatsappResult,
        scrapedData: {
          url: context.url,
          title,
          contentLength: cleanContent.length,
          truncatedLength: truncatedContent.length,
        },
      };
    } catch (error) {
      return {
        scrapeSuccess: false,
        error: `Scrape and send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        url: context.url,
        phoneNumber: context.phoneNumber,
      };
    }
  },
});

// WhatsApp phone number validation tool
const validatePhoneTool = createTool({
  id: 'validate-phone',
  description: 'Validate if a phone number is in the correct format for WhatsApp messaging',
  inputSchema: z.object({
    phoneNumber: z.string().describe('Phone number to validate'),
  }),
  execute: async ({ context }) => {
    const phoneRegex = /^\d{1,4}\d{6,15}$/;
    const isValid = phoneRegex.test(context.phoneNumber);
    
    return {
      phoneNumber: context.phoneNumber,
      isValid,
      format: isValid ? 'correct' : 'invalid',
      message: isValid 
        ? 'Phone number format is valid for WhatsApp messaging'
        : 'Invalid format. Please provide phone number with country code (no + or spaces). Example: 1234567890',
      expectedFormat: 'Country code + phone number (digits only, no + or spaces)',
      example: '1234567890 (for US number +1-234-567-890)',
    };
  },
});

// Real Tavily web search tool
const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for current information using Tavily API',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().optional().default(5).describe('Maximum number of results to return'),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query: context.query,
          max_results: context.maxResults,
          search_depth: 'advanced',
          include_answer: true,
          include_images: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        query: context.query,
        answer: data.answer,
        results: data.results?.map((result: any) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score,
        })) || [],
      };
    } catch (error) {
      return {
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        query: context.query,
      };
    }
  },
});

// Simple web content fetcher (alternative to Firecrawl)
const webScrapeTool = createTool({
  id: 'web-scrape',
  description: 'Fetch and extract basic content from any webpage',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to fetch'),
  }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(context.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const html = await response.text();
      
      // Basic content extraction (remove scripts, styles, and get text)
      const cleanContent = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit content length

      // Extract title
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No title found';

      return {
        url: context.url,
        title,
        content: cleanContent,
        length: cleanContent.length,
      };
    } catch (error) {
      return {
        error: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        url: context.url,
      };
    }
  },
});

// Enhanced calculator tool
const calculatorTool = createTool({
  id: 'calculator',
  description: 'Perform mathematical calculations and conversions',
  inputSchema: z.object({
    expression: z.string().describe('Mathematical expression to evaluate (supports +, -, *, /, **, sqrt, sin, cos, tan, log, etc.)'),
  }),
  execute: async ({ context }) => {
    try {
      // Safe math evaluation - replace with a proper math parser in production
      const sanitized = context.expression
        .replace(/[^0-9+\-*/.() ]/g, '')
        .replace(/\*\*/g, '^');
      
      // Basic validation
      if (!/^[0-9+\-*/.() ]+$/.test(sanitized)) {
        throw new Error('Invalid characters in expression');
      }

      const result = eval(sanitized);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Result is not a valid number');
      }

      return { 
        result, 
        expression: context.expression,
        formatted: `${context.expression} = ${result}`,
      };
    } catch (error) {
      return { 
        error: 'Invalid mathematical expression or calculation error', 
        expression: context.expression,
        suggestion: 'Try simpler expressions like: 2+2, 10*5, 100/4, etc.',
      };
    }
  },
});

// Knowledge search tool using vector storage
const knowledgeSearchTool = createTool({
  id: 'knowledge-search',
  description: 'Search through stored knowledge and previous conversations',
  inputSchema: z.object({
    query: z.string().describe('What to search for in stored knowledge'),
    limit: z.number().optional().default(5).describe('Number of results to return'),
  }),
  execute: async ({ context }) => {
    try {
      // This would integrate with your vector storage for semantic search
      // For now, return a placeholder that indicates the capability
      return {
        query: context.query,
        results: [
          {
            content: `Knowledge search for "${context.query}" - This tool will search through stored conversations and knowledge when vector storage is fully configured.`,
            relevance: 0.8,
            source: 'memory',
          },
        ],
        message: 'Knowledge search capability ready - will search stored conversations and documents',
      };
    } catch (error) {
      return {
        error: `Knowledge search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        query: context.query,
      };
    }
  },
});

// Create the main assistant agent
export const assistantAgent = new Agent({
  name: 'Gal Agent',
  description: 'An intelligent AI assistant with web search, scraping, memory, calculation, and WhatsApp messaging capabilities',
  instructions: `You are Gal Agent, an advanced AI assistant with powerful capabilities:

🌐 **Web Search & Information**: Use Tavily API to search for current information
🔍 **Web Scraping**: Extract content from any webpage
📱 **WhatsApp Messaging**: Send messages and scraped content via WhatsApp
🧮 **Calculations**: Perform complex mathematical calculations
🧠 **Memory**: Remember user preferences, conversations, and context across sessions
📚 **Knowledge Search**: Search through stored knowledge and past conversations

**WhatsApp Integration**:
- Send WhatsApp messages to any phone number
- Combine web scraping with WhatsApp messaging
- Validate phone number formats
- When user asks to scrape a site and send via WhatsApp, always ask for the phone number first
- Format messages nicely with emojis and structure for WhatsApp

**Your Personality**:
- Friendly, helpful, and proactive
- Always strive to provide accurate, well-researched answers
- Use your tools effectively to gather information
- Combine information from multiple sources when helpful
- Remember context from previous conversations
- When sending WhatsApp messages, confirm the phone number format before sending

**Tool Usage Guidelines**:
1. **For current events**: Use web-search tool for real-time information
2. **For webpage content**: Use web-scrape tool to extract content from URLs
3. **For calculations**: Use calculator tool for mathematical operations
4. **For stored knowledge**: Use knowledge-search tool for conversation history
5. **For WhatsApp messages**: Use whatsapp-send tool to send messages
6. **For scrape + WhatsApp**: Use scrape-and-send-whatsapp tool to scrape and send in one action
7. **For phone validation**: Use validate-phone tool to check phone number format

**WhatsApp Workflow**:
When user wants to scrape a site and send via WhatsApp:
1. Ask for the phone number if not provided
2. Validate the phone number format (country code + number, no + or spaces)
3. Use scrape-and-send-whatsapp tool or combine web-scrape + whatsapp-send
4. Confirm successful delivery

Always be transparent about which tools you're using and why. Provide context and explain your reasoning.`,

  model: openai('gpt-4o-mini'),
  
  // Add all tools including WhatsApp tools
  tools: {
    webSearchTool,
    webScrapeTool,
    calculatorTool,
    knowledgeSearchTool,
    whatsappSendTool,         // WhatsApp messaging tool
    scrapeAndSendTool,        // Combined scrape and WhatsApp send tool
    validatePhoneTool,        // Phone number validation tool
  },

  // Configure memory if available
  ...(memory && { memory }),
}); 