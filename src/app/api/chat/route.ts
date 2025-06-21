import { NextRequest } from 'next/server';
import { mastra } from '../../../mastra/index';

export const runtime = 'nodejs';

// Handle GET requests (for health checks, preflight, etc.)
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Chat API is running',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Missing OPENAI_API_KEY environment variable' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, threadId, resourceId } = await req.json();

    // Get the agent from Mastra
    const agent = mastra.getAgent('assistantAgent');

    if (!agent) {
      return new Response(JSON.stringify({ 
        error: 'Agent not found - check Mastra configuration' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage || latestMessage.role !== 'user') {
      return new Response('Invalid message format', { status: 400 });
    }

    // Stream response from the agent
    const result = await agent.stream(latestMessage.content, {
      memory: {
        thread: threadId,
        resource: resourceId,
      },
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          
          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            
            // Send chunk in AI SDK format
            const data = JSON.stringify({
              id: crypto.randomUUID(),
              role: 'assistant',
              content: fullResponse,
              createdAt: new Date().toISOString(),
            });
            
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          // Send final message
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 