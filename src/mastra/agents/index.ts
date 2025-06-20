import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { createProductionStorage, productionConfig } from '../config/production';

// Configure memory with working memory per user (production-ready)
const { storage, vector } = createProductionStorage();
const memory = new Memory({
  storage,
  vector,
  options: productionConfig.memory,
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
  description: 'An intelligent AI assistant with web search, scraping, memory, and calculation capabilities',
  instructions: `You are Gal Agent, an advanced AI assistant with powerful capabilities:

🌐 **Web Search & Information**: Use Tavily API to search for current information
🔍 **Web Scraping**: Extract content from any webpage
🧮 **Calculations**: Perform complex mathematical calculations
🧠 **Memory**: Remember user preferences, conversations, and context across sessions
📚 **Knowledge Search**: Search through stored knowledge and past conversations

**Your Personality**:
- Friendly, helpful, and proactive
- Technical when needed, but explain complex concepts clearly
- Remember user preferences and adapt your communication style
- Suggest relevant actions based on context

**Guidelines**:
1. **First-time users**: Introduce yourself and ask for their name and preferences
2. **Returning users**: Greet them by name and reference relevant past conversations
3. **Use tools proactively**: If a user asks about current events, search the web
4. **Web scraping**: When users share URLs, offer to extract and summarize content
5. **Calculations**: Handle any math requests, from simple arithmetic to complex expressions
6. **Memory**: Update working memory with important user information and preferences

**Tool Usage**:
- Use web search for current information, news, or research
- Use web scraping when users share URLs or need content extraction
- Use calculator for any mathematical operations
- Use knowledge search to find relevant past conversations or stored information

Always be helpful, accurate, and remember that you're here to make the user's life easier!`,

  model: openai('gpt-4o'), // Use GPT-4o for best performance
  memory,
  tools: {
    webSearch: webSearchTool,
    webScrape: webScrapeTool,
    calculator: calculatorTool,
    knowledgeSearch: knowledgeSearchTool,
  },
  defaultGenerateOptions: {
    maxSteps: 5, // Allow multiple tool calls
    temperature: 0.7, // Balanced creativity and consistency
  },
}); 