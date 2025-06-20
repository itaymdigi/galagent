import { NextRequest } from 'next/server';
import { mastra } from '../../../mastra/index';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages, threadId, resourceId } = await req.json();

    // Get the agent from Mastra
    const agent = mastra.getAgent('assistantAgent');

    if (!agent) {
      return new Response('Agent not found', { status: 404 });
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