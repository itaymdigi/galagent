# 🤖 Gal Agent

An intelligent AI assistant built with Mastra featuring web search, scraping, memory, and calculation capabilities.

## ✨ Features

### 🌐 Web Search & Information
- **Tavily API Integration**: Search the internet for current information
- **Real-time Results**: Get up-to-date search results with relevance scoring

### 🔍 Web Scraping
- **Content Extraction**: Extract clean content from any webpage
- **Smart Parsing**: Automatically removes scripts, styles, and extracts meaningful text

### 🧮 Advanced Calculations
- **Mathematical Operations**: Handle complex mathematical expressions
- **Safe Evaluation**: Secure calculation processing with error handling

### 🧠 Persistent Memory
- **User Memory**: Remember preferences and context across sessions
- **Conversation History**: Semantic search through past conversations
- **Working Memory**: Maintain detailed user profiles and session context

### 📚 Knowledge Search
- **Semantic Recall**: Find relevant information from stored conversations
- **Context-Aware**: Provide responses based on historical interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/pnpm
- API Keys (OpenAI, Tavily)

### Installation

1. **Clone and Install**:
   ```powershell
   git clone <your-repo>
   cd galagent
   npm install --force
   ```

2. **Set up Environment Variables**:
   Create a `.env` file with your API keys:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_key_here
   
   # Tavily Search API
   TAVILY_API_KEY=your_tavily_key_here
   
   # Database (Local SQLite)
   LIBSQL_URL=file:./mastra.db
   
   # Next.js Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MASTRA_APP_URL=http://localhost:4111
   ```

### 🎯 Running the Application

#### 🌐 Web Interface (Recommended)
```powershell
npm run dev
```
Open http://localhost:3000 for a beautiful chat interface

#### 💻 Terminal Chat
```powershell
npm run agent:chat
```
Interactive CLI chat experience

#### 🛠️ Mastra Dev Server
```powershell
npm run mastra:dev
```
Open http://localhost:4111 for Mastra's built-in interface

## 🎨 Web Interface Features

- **Real-time Streaming**: See responses as they're generated
- **Tool Visualization**: Watch web searches and calculations in action
- **Modern UI**: Beautiful, responsive design with dark/light themes
- **Memory Indicators**: Visual feedback when memory is being updated
- **Mobile Friendly**: Works great on all devices

## 🔧 Configuration

### Database Options

Choose your preferred storage backend:

```env
# Local SQLite (Development)
LIBSQL_URL=file:./mastra.db

# Turso Cloud SQLite
LIBSQL_URL=libsql://your-database.turso.io
LIBSQL_AUTH_TOKEN=your_auth_token

# PostgreSQL (Production)
DATABASE_URL=postgresql://user:password@host:port/database

# Upstash Redis (Serverless)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Memory Configuration

The agent uses advanced memory features:

- **Working Memory**: Detailed user profiles with preferences and context
- **Semantic Recall**: Search through conversation history
- **Thread Management**: Automatic conversation organization
- **User-Specific Memory**: Each user gets their own memory space

## 📁 Project Structure

```
galagent/
├── src/
│   ├── app/                    # Next.js web application
│   │   ├── page.tsx           # Main chat interface
│   │   ├── layout.tsx         # App layout
│   │   └── api/chat/          # Chat API endpoint
│   ├── mastra/                # Mastra configuration
│   │   ├── index.ts           # Main Mastra instance
│   │   ├── agents/            # Agent definitions
│   │   │   └── index.ts       # Gal Agent with tools
│   │   └── config/            # Production configuration
│   └── agent-cli.ts           # Terminal interface
├── .env                       # Environment variables
└── package.json              # Dependencies and scripts
```

## 🛠️ Available Tools

### 🌐 Web Search
```typescript
// Search for current information
webSearch({
  query: "latest AI news",
  maxResults: 5
})
```

### 🔍 Web Scraping
```typescript
// Extract content from any webpage
webScrape({
  url: "https://example.com"
})
```

### 🧮 Calculator
```typescript
// Perform mathematical calculations
calculator({
  expression: "2 + 2 * 5"
})
```

### 📚 Knowledge Search
```typescript
// Search through stored conversations
knowledgeSearch({
  query: "previous discussions about AI",
  limit: 5
})
```

## 🚀 Deployment

### Vercel (Recommended)
```powershell
npm run deploy:vercel
```

### Railway
```powershell
npm run deploy:railway
```

## 💡 Usage Examples

### Basic Conversation
```
User: Hi, what's the weather like today?
Gal Agent: I'll search for current weather information for you.
[Uses web search tool to find weather data]
```

### Web Scraping
```
User: Can you analyze this article? https://example.com/article
Gal Agent: I'll extract and analyze the content from that webpage.
[Uses web scraping tool to extract article content]
```

### Calculations
```
User: What's 15% of 250?
Gal Agent: Let me calculate that for you.
[Uses calculator tool: 250 * 0.15 = 37.5]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Mastra.ai](https://mastra.ai) - The AI framework powering this agent
- [Tavily](https://tavily.com) - Web search API
- [OpenAI](https://openai.com) - Language model provider

---

**Made with ❤️ using Mastra AI Framework**
