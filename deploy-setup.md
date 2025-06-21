# Vercel Deployment Setup Guide

## Step 1: Link Your Project to Vercel

Run this command and follow the prompts:
```powershell
npx vercel
```

When prompted:
- Choose your scope (your Vercel account)
- Choose "N" for linking to existing project (unless you have one)
- Accept the default settings

## Step 2: Set Up Environment Variables

You need to add these environment variables in your Vercel dashboard:

### Required Variables:
```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_url_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### Optional (for advanced storage):
```
LIBSQL_URL=your_libsql_url
LIBSQL_AUTH_TOKEN=your_libsql_token
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

## Step 3: Database Options

Choose one of these database options:

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Add Vercel Postgres to your project
3. It will automatically set the DATABASE_URL

### Option B: Supabase (Free tier available)
1. Create a Supabase project
2. Get your connection string from Settings > Database
3. Add as DATABASE_URL environment variable

### Option C: Railway Postgres
1. Create a Railway project
2. Add PostgreSQL service
3. Copy the connection string to DATABASE_URL

## Step 4: Deploy

After setting up environment variables:
```powershell
npx vercel --prod
```

## Troubleshooting

### If you get build errors:
1. Check all environment variables are set
2. Make sure OPENAI_API_KEY is valid
3. Verify database connection

### If the app loads but chat doesn't work:
1. Check browser console for errors
2. Verify API routes are working
3. Check Vercel function logs

## Quick Commands

```powershell
# Check project status
npx vercel ls

# Deploy to production
npx vercel --prod

# Check logs
npx vercel logs

# Set environment variable
npx vercel env add
``` 