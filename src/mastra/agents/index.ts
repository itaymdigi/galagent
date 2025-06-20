import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { createProductionStorage, productionConfig } from '../config/production.js';

// Configure memory with working memory per user (production-ready)
const { storage, vector } = createProductionStorage();
const memory = new Memory({
  storage,
  vector,
  options: productionConfig.memory,
});

// Create a useful tool for the agent
const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for current information on any topic',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ context }) => {
    // Simulated web search - in real implementation, you'd use a real search API
    return {
      results: [
        {
          title: `Search results for: ${context.query}`,
          url: 'https://example.com',
          snippet: `This is a simulated search result for "${context.query}". In a real implementation, you would integrate with Google Search API, Bing API, or similar service.`,
        },
      ],
    };
  },
});

const calculatorTool = createTool({
  id: 'calculator',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({
    expression: z.string().describe('Mathematical expression to evaluate'),
  }),
  execute: async ({ context }) => {
    try {
      // Simple evaluation - in production, use a proper math parser
      const result = eval(context.expression);
      return { result, expression: context.expression };
    } catch (error) {
      return { error: 'Invalid mathematical expression', expression: context.expression };
    }
  },
});

// Create the main assistant agent
export const assistantAgent = new Agent({
  name: 'Personal Assistant',
  description: 'An intelligent personal assistant with memory capabilities',
  instructions: `You are an intelligent personal assistant with advanced memory capabilities. 

Your key features:
- You remember information about users across conversations
- You can search the web for current information
- You can perform calculations
- You maintain context and learn user preferences over time

Guidelines:
- Always be helpful, accurate, and engaging
- Remember user preferences and refer to them when relevant
- Use tools when appropriate to provide better assistance
- Keep track of ongoing projects and goals in working memory
- Be proactive in offering relevant suggestions based on past conversations

When a user first interacts with you:
1. Introduce yourself and your capabilities
2. Ask for their name and any preferences
3. Update your working memory with this information

For returning users:
1. Greet them by name if you know it
2. Reference relevant past conversations when helpful
3. Check if they want to continue previous topics or start something new`,

  model: openai('gpt-4o'), // Use GPT-4o for best performance
  memory,
  tools: {
    webSearch: webSearchTool,
    calculator: calculatorTool,
  },
  defaultGenerateOptions: {
    maxSteps: 5, // Allow multiple tool calls
    temperature: 0.7, // Balanced creativity and consistency
  },
}); 