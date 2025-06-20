#!/usr/bin/env node

import 'dotenv/config';
import { createProductionStorage } from '../src/mastra/config/production.js';

async function testConnections() {
  console.log('🔍 Testing connections...\n');

  // Test OpenAI API Key
  console.log('1. Testing OpenAI API Key...');
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API connection successful');
    } else {
      console.log('❌ OpenAI API connection failed:', response.status);
    }
  } catch (error) {
    console.log('❌ OpenAI API connection error:', error.message);
  }

  // Test Database Connection
  console.log('\n2. Testing Database Connection...');
  try {
    const { storage } = createProductionStorage();
    
    // Test basic storage operation
    await storage.set('test-key', 'test-value');
    const value = await storage.get('test-key');
    await storage.delete('test-key');
    
    if (value === 'test-value') {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed - data mismatch');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  }

  // Environment Variables Check
  console.log('\n3. Environment Variables Check...');
  const requiredVars = ['OPENAI_API_KEY'];
  const optionalVars = ['DATABASE_URL', 'LIBSQL_URL', 'UPSTASH_REDIS_REST_URL'];
  
  console.log('Required variables:');
  requiredVars.forEach(varName => {
    const status = process.env[varName] ? '✅' : '❌';
    console.log(`  ${status} ${varName}`);
  });
  
  console.log('Database variables (at least one required):');
  let hasDatabase = false;
  optionalVars.forEach(varName => {
    const exists = !!process.env[varName];
    if (exists) hasDatabase = true;
    const status = exists ? '✅' : '⚪';
    console.log(`  ${status} ${varName}`);
  });
  
  if (!hasDatabase) {
    console.log('❌ No database configuration found');
  }

  console.log('\n🎉 Connection test complete!');
}

testConnections().catch(console.error); 