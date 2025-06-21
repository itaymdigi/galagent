# WhatsApp Integration Setup Guide

## 🚀 Quick Setup

Your Gal Agent now has WhatsApp messaging capabilities! Here's how to set it up:

### 1. Get WaPulse Credentials

1. Sign up at [WaPulse.com](https://wapulse.com)
2. Create a new WhatsApp instance
3. Get your credentials:
   - **Token**: Your API token
   - **Instance ID**: Your WhatsApp instance ID

### 2. Set Environment Variables

Create a `.env.local` file in your project root with:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# WaPulse WhatsApp API Credentials (required for WhatsApp)
WAPULSE_TOKEN=your_wapulse_token_here
WAPULSE_INSTANCE_ID=your_wapulse_instance_id_here

# Optional: Tavily API Key (for web search)
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Connect Your WhatsApp

1. Start your instance on WaPulse dashboard
2. Scan the QR code with your WhatsApp mobile app
3. Your WhatsApp is now connected!

## 📱 How to Use

### Basic WhatsApp Messaging

Ask your agent:
- "Send a WhatsApp message to 1234567890 saying hello"
- "Send this information to my WhatsApp: [phone number]"

### Scrape + WhatsApp (Your Main Use Case!)

Ask your agent:
- "Scrape https://example.com and send the content to WhatsApp"
- "Get the latest news from [website] and send it to my phone"
- "Extract information from [URL] and WhatsApp it to me"

The agent will:
1. **Ask for your phone number** (if not provided)
2. **Validate the format** (country code + number, no + or spaces)
3. **Scrape the website** 
4. **Format the content nicely**
5. **Send via WhatsApp** with emojis and structure

### Phone Number Format

✅ **Correct**: `1234567890` (country code + number, no + or spaces)
❌ **Wrong**: `+1-234-567-890`, `+1 234 567 890`, `234-567-890`

**Examples**:
- US: `1234567890` (for +1-234-567-890)
- UK: `447123456789` (for +44-7123-456789)
- India: `919876543210` (for +91-9876543210)

## 🛠️ Available Tools

Your agent now has these WhatsApp tools:

1. **whatsapp-send**: Send any message to a phone number
2. **scrape-and-send-whatsapp**: Scrape a website and send content via WhatsApp
3. **validate-phone**: Check if phone number format is correct

## 🎯 Example Conversations

**User**: "Scrape https://news.ycombinator.com and send the top stories to WhatsApp"

**Agent**: "I'd be happy to scrape Hacker News and send you the content via WhatsApp! What's your phone number? Please provide it with the country code and no spaces (example: 1234567890)."

**User**: "1234567890"

**Agent**: *[Scrapes the website, formats the content nicely, and sends via WhatsApp]*

## 🔧 Troubleshooting

### Common Issues:

1. **"WaPulse credentials not configured"**
   - Make sure you set `WAPULSE_TOKEN` and `WAPULSE_INSTANCE_ID` in `.env.local`

2. **"Invalid phone number format"**
   - Use only digits with country code: `1234567890`
   - No spaces, dashes, or + symbols

3. **"WhatsApp instance not connected"**
   - Check your WaPulse dashboard
   - Make sure you scanned the QR code
   - Restart the instance if needed

### Getting Help:

- Check WaPulse dashboard for instance status
- Verify your phone number format with the validate-phone tool
- Make sure your WhatsApp is connected and active

## 🌟 Pro Tips

1. **Phone Number Validation**: The agent can validate phone numbers before sending
2. **Custom Messages**: You can add custom text along with scraped content
3. **Content Length**: Long content is automatically truncated for WhatsApp
4. **Rich Formatting**: Messages include emojis and nice formatting

Your agent is now ready to scrape websites and send the information directly to your WhatsApp! 🎉 