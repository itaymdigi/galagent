# 🚀 Deployment Guide for GalAgent

This guide covers deploying your Mastra agent with working memory per user capabilities to various hosting platforms.

## 📋 Prerequisites

1. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Database** - Choose one:
   - **Supabase** (Recommended for Vercel)
   - **Neon** (PostgreSQL)
   - **Railway PostgreSQL**
   - **Turso** (LibSQL)
   - **Upstash** (Redis)

## 🌟 Recommended: Vercel + Supabase

### Step 1: Setup Supabase Database

```powershell
# Install Supabase CLI
npm install -g supabase

# Login and create project
supabase login
supabase projects create galagent-db
```

### Step 2: Deploy to Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
```

**Environment Variables for Vercel:**
- `OPENAI_API_KEY`: Your OpenAI API key
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Your Vercel app URL

### Step 3: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Copy the connection string
4. Enable the `vector` extension in SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 🚂 Alternative: Railway

Railway provides excellent support for full-stack applications with databases.

### Step 1: Deploy to Railway

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 2: Add PostgreSQL Database

1. Go to your Railway project dashboard
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### Step 3: Configure Environment Variables

```powershell
railway variables set OPENAI_API_KEY=your_key_here
```

## 🎨 Alternative: Render

### Step 1: Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Build Settings

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+

### Step 3: Add Database

1. Create a new PostgreSQL database service
2. Copy the connection string to `DATABASE_URL`

## 📊 Database Options Comparison

| Platform | Best For | Pros | Cons |
|----------|----------|------|------|
| **Supabase** | Vercel deployments | Vector support, generous free tier, built-in auth | Learning curve |
| **Neon** | PostgreSQL needs | Serverless PostgreSQL, branching | Limited free tier |
| **Railway PostgreSQL** | Full-stack apps | Easy setup, persistent storage | Cost for larger apps |
| **Turso (LibSQL)** | Edge deployments | Fast, edge-replicated | Newer platform |
| **Upstash Redis** | High-speed cache | Ultra-fast, serverless | Limited query capabilities |

## 🔧 Environment Variables Reference

Create a `.env.local` file for local development:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Database (choose one)
DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL
LIBSQL_URL=libsql://your-db.turso.io              # Turso
LIBSQL_AUTH_TOKEN=your_turso_token                # Turso auth
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io # Upstash
UPSTASH_REDIS_REST_TOKEN=your_upstash_token       # Upstash

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
MASTRA_APP_URL=http://localhost:4111
```

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

1. **Web Interface**: `https://your-app.com`
2. **Health Check**: `https://your-app.com/api/health`
3. **Agent API**: `https://your-app.com/api/agent`

## 📝 Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database connection is working
- [ ] OpenAI API key is valid and has credits
- [ ] Vector extension is enabled (for PostgreSQL)
- [ ] Memory persistence is working
- [ ] Tools (web search, calculator) are functional

## 🔍 Troubleshooting

### Common Issues

**Database Connection Errors:**
```powershell
# Test database connection locally
node -e "console.log(process.env.DATABASE_URL)"
```

**Memory Not Persisting:**
- Check if vector extension is enabled
- Verify database permissions
- Check storage configuration in production config

**OpenAI API Errors:**
- Verify API key is correct
- Check API usage limits
- Ensure sufficient credits

### Logs and Monitoring

**Vercel:**
```powershell
vercel logs
```

**Railway:**
```powershell
railway logs
```

**Render:**
Check logs in the Render dashboard

## 🚀 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Connection Pooling**: Use connection pooling for PostgreSQL
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Rate Limiting**: Configure rate limiting in production

## 📚 Additional Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs) 