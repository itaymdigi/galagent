import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { PostgresStore } from '@mastra/pg';
import { UpstashStore, UpstashVector } from '@mastra/upstash';

// Production database configuration based on environment
export function createProductionStorage() {
  // For production deployment without database, use in-memory storage
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return {
      storage: undefined, // Disable storage for now
      vector: undefined,  // Disable vector storage for now
    };
  }

  // PostgreSQL (Supabase, Neon, Railway, etc.)
  if (process.env.DATABASE_URL) {
    return {
      storage: new PostgresStore({
        connectionString: process.env.DATABASE_URL,
      }),
      vector: undefined, // Disable vector storage for now
    };
  }

  // Upstash Redis
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      storage: new UpstashStore({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      vector: new UpstashVector({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
    };
  }

  // LibSQL with Turso (cloud)
  if (process.env.LIBSQL_URL && process.env.LIBSQL_AUTH_TOKEN) {
    return {
      storage: new LibSQLStore({
        url: process.env.LIBSQL_URL,
        authToken: process.env.LIBSQL_AUTH_TOKEN,
      }),
      vector: new LibSQLVector({
        connectionUrl: process.env.LIBSQL_URL,
        authToken: process.env.LIBSQL_AUTH_TOKEN,
      }),
    };
  }

  // Fallback for development
  return {
    storage: new LibSQLStore({
      url: 'file:./mastra.db',
    }),
    vector: new LibSQLVector({
      connectionUrl: 'file:./mastra.db',
    }),
  };
}

// Environment-specific configurations
export const productionConfig = {
  // Use environment variable for OpenAI API key
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Database configuration
  database: createProductionStorage(),
  
  // Memory settings optimized for production
  memory: {
    lastMessages: 15, // Slightly higher for production
    // semanticRecall: {
    //   topK: 5, // More context in production
    //   messageRange: 3,
    //   scope: 'resource' as const,
    // },
    workingMemory: {
      enabled: true,
      // More detailed template for production
      template: `
# User Profile
## Personal Information
- Name:
- Email:
- Occupation:
- Location:
- Timezone:
- Preferred Language:

## Preferences & Communication
- Communication Style: [Formal, Casual, Technical, Friendly]
- Response Length Preference: [Brief, Detailed, Comprehensive]
- Topics of Interest:
- Learning Goals:
- Current Projects:

## Technical Context
- Programming Languages:
- Frameworks/Tools:
- Experience Level:
- Current Challenges:

## Session Context
- Session Start Time:
- Key Discussion Points:
- Action Items:
- Follow-up Tasks:
- Important Deadlines:

## Conversation History
- Recurring Themes:
- Preferred Solutions:
- Past Successful Approaches:
- Areas of Confusion:
- Progress Tracking:
`,
    },
    threads: {
      generateTitle: true,
      maxTitleLength: 50,
    },
  },
  
  // Rate limiting and performance
  rateLimiting: {
    enabled: true,
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
  },
  
  // Logging for production monitoring
  logging: {
    enabled: true,
    level: 'info',
    includeMemoryUpdates: false, // Don't log sensitive memory data
  },
}; 