# GalAgent - Mastra AI Assistant with Memory

A powerful AI assistant built with Mastra that remembers conversations and learns about users over time using the latest working memory per user features.

## Features

- 🧠 **Working Memory Per User**: Maintains persistent memory about each user across conversations
- 🔍 **Semantic Recall**: Searches through conversation history to find relevant context
- 🛠️ **Tool Integration**: Web search and calculator capabilities
- 💬 **Terminal Interface**: Clean command-line chat experience
- 🔄 **Multi-threaded Conversations**: Support for multiple conversation threads per user
- 💾 **Persistent Storage**: Uses LibSQL for reliable data persistence

## Quick Start

### 1. Install Dependencies

```powershell
pnpm install
```

### 2. Set Up Environment

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Agent in Terminal

```powershell
pnpm run agent:chat
```

### 4. Or Use Mastra Dev Server

```powershell
pnpm run mastra:dev
```

Then visit `http://localhost:4111` for the web interface.

## Terminal Commands

- **exit** - Quit the application
- **new** - Start a new conversation thread
- **Ctrl+C** - Graceful shutdown

## Memory Features

The agent uses advanced memory capabilities:

### Working Memory
- Stores user profile information (name, preferences, goals)
- Tracks ongoing projects and conversations
- Maintains context across sessions

### Semantic Recall
- Searches through conversation history for relevant information
- Retrieves related discussions from past conversations
- Provides context-aware responses

### Thread Management
- Multiple conversation threads per user
- Automatic thread title generation
- Persistent storage across sessions

## Architecture

```
src/
├── mastra/
│   ├── index.ts          # Main Mastra configuration
│   └── agents/
│       └── index.ts      # Agent definition with memory
├── agent-cli.js          # Terminal interface
└── app/                  # Next.js web interface (optional)
```

## Hosting Options

### For Next.js Deployment

**Supabase vs Upstash for Vercel:**

- **Supabase** (Recommended for Next.js):
  - ✅ Full PostgreSQL database with vector support
  - ✅ Built-in auth, real-time subscriptions
  - ✅ Generous free tier (500MB database)
  - ✅ Better for complex queries and relationships
  - ✅ Supports semantic recall with pgvector

- **Upstash** (Good for simple use cases):
  - ✅ Redis-based, extremely fast
  - ✅ Serverless-friendly
  - ✅ Great for caching and sessions
  - ❌ Limited query capabilities vs PostgreSQL
  - ❌ More expensive for large datasets

**Recommendation**: Use **Supabase** for Next.js on Vercel because:
1. Better memory/conversation storage with full SQL
2. Built-in vector search for semantic recall
3. More cost-effective at scale
4. Better developer experience with Next.js

### Configuration Examples

#### Supabase Setup
```typescript
import { PostgresStore, PostgresVector } from '@mastra/pg';

const memory = new Memory({
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL,
  }),
  vector: new PostgresVector({
    connectionString: process.env.DATABASE_URL,
  }),
});
```

#### Upstash Setup
```typescript
import { UpstashStore, UpstashVector } from '@mastra/upstash';

const memory = new Memory({
  storage: new UpstashStore({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  vector: new UpstashVector({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  }),
});
```

## Special Versions

This project uses the special working memory per user versions:
- `@mastra/core@0.0.0-working-memory-per-user-20250620163010`
- `@mastra/memory@0.0.0-working-memory-per-user-20250620163010`
- `@mastra/libsql@0.0.0-working-memory-per-user-20250620163010`
- `@mastra/upstash@0.0.0-working-memory-per-user-20250620163010`
- `@mastra/pg@0.0.0-working-memory-per-user-20250620163010`

## Development

### Terminal Agent
```powershell
pnpm run agent:chat
```

### Web Interface
```powershell
pnpm run mastra:dev
```

### Next.js Development
```powershell
pnpm run dev
```

## Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [Memory Guide](https://mastra.ai/docs/memory/overview)
- [Agent Documentation](https://mastra.ai/docs/agents/overview)
- [Working Memory](https://mastra.ai/docs/memory/working-memory)
