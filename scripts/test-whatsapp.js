#!/usr/bin/env node

/**
 * Test script for WhatsApp integration
 * Run with: node scripts/test-whatsapp.js
 */

import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testWaPulseCredentials() {
  log(colors.blue, '\n🔍 Testing WaPulse Credentials...');
  
  const token = process.env.WAPULSE_TOKEN;
  const instanceID = process.env.WAPULSE_INSTANCE_ID;
  
  if (!token) {
    log(colors.red, '❌ WAPULSE_TOKEN not found in environment variables');
    return false;
  }
  
  if (!instanceID) {
    log(colors.red, '❌ WAPULSE_INSTANCE_ID not found in environment variables');
    return false;
  }
  
  log(colors.green, '✅ WaPulse credentials found');
  log(colors.yellow, `   Token: ${token.substring(0, 10)}...`);
  log(colors.yellow, `   Instance ID: ${instanceID}`);
  
  return true;
}

async function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^\d{1,4}\d{6,15}$/;
  const isValid = phoneRegex.test(phoneNumber);
  
  if (isValid) {
    log(colors.green, `✅ Phone number format is valid: ${phoneNumber}`);
  } else {
    log(colors.red, `❌ Invalid phone number format: ${phoneNumber}`);
    log(colors.yellow, '   Expected format: country code + number (digits only, no + or spaces)');
    log(colors.yellow, '   Example: 1234567890 (for US +1-234-567-890)');
  }
  
  return isValid;
}

async function testWhatsAppMessage(phoneNumber, message) {
  log(colors.blue, '\n📱 Testing WhatsApp Message Sending...');
  
  const token = process.env.WAPULSE_TOKEN;
  const instanceID = process.env.WAPULSE_INSTANCE_ID;
  
  try {
    const response = await fetch(`https://wapulse.com/api/v1/instances/${instanceID}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
        type: 'user',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`WaPulse API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    log(colors.green, '✅ WhatsApp message sent successfully!');
    log(colors.yellow, `   Message ID: ${result.messageId || 'unknown'}`);
    log(colors.yellow, `   Phone: ${phoneNumber}`);
    log(colors.yellow, `   Message length: ${message.length} characters`);
    
    return true;
  } catch (error) {
    log(colors.red, `❌ Failed to send WhatsApp message: ${error.message}`);
    return false;
  }
}

async function testWebScraping(url) {
  log(colors.blue, '\n🌐 Testing Web Scraping...');
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const html = await response.text();
    const cleanContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500); // Preview
    
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No title found';
    
    log(colors.green, '✅ Web scraping successful!');
    log(colors.yellow, `   Title: ${title}`);
    log(colors.yellow, `   Content preview: ${cleanContent.substring(0, 100)}...`);
    log(colors.yellow, `   Total content length: ${cleanContent.length} characters`);
    
    return { title, content: cleanContent };
  } catch (error) {
    log(colors.red, `❌ Web scraping failed: ${error.message}`);
    return null;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  log(colors.bold, '🤖 Gal Agent WhatsApp Integration Test');
  log(colors.blue, '=====================================\n');
  
  // Test 1: Check credentials
  const hasCredentials = await testWaPulseCredentials();
  if (!hasCredentials) {
    log(colors.red, '\n❌ Setup incomplete. Please check WHATSAPP_SETUP.md for instructions.');
    rl.close();
    return;
  }
  
  // Test 2: Get phone number and validate
  const phoneNumber = await askQuestion('\n📱 Enter your phone number (with country code, no + or spaces): ');
  const isValidPhone = await validatePhoneNumber(phoneNumber);
  
  if (!isValidPhone) {
    rl.close();
    return;
  }
  
  // Test 3: Send test message
  const sendTest = await askQuestion('\n💬 Send a test WhatsApp message? (y/n): ');
  if (sendTest.toLowerCase() === 'y') {
    const testMessage = '🤖 Hello from Gal Agent!\n\nThis is a test message to verify WhatsApp integration is working correctly. 🎉';
    await testWhatsAppMessage(phoneNumber, testMessage);
  }
  
  // Test 4: Test web scraping
  const scrapeTest = await askQuestion('\n🌐 Test web scraping? (y/n): ');
  if (scrapeTest.toLowerCase() === 'y') {
    const url = await askQuestion('Enter URL to scrape (or press Enter for default): ') || 'https://example.com';
    const scraped = await testWebScraping(url);
    
    if (scraped) {
      const sendScraped = await askQuestion('\n📤 Send scraped content via WhatsApp? (y/n): ');
      if (sendScraped.toLowerCase() === 'y') {
        const message = `📄 *${scraped.title}*\n\n🔗 *Source:* ${url}\n\n📝 *Content:*\n${scraped.content}`;
        await testWhatsAppMessage(phoneNumber, message);
      }
    }
  }
  
  log(colors.green, '\n✅ Test completed!');
  log(colors.blue, 'Your WhatsApp integration is ready to use with Gal Agent.');
  
  rl.close();
}

main().catch(console.error); 