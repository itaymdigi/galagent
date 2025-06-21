import { NextRequest } from 'next/server';
import { mastra } from '../../../mastra/index';

export const runtime = 'nodejs';

// Handle GET requests (for health checks, preflight, etc.)
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Chat API is running',
    timestamp: new Date().toISOString(),
    env_check: {
      openai: !!process.env.OPENAI_API_KEY,
      tavily: !!process.env.TAVILY_API_KEY,
      wapulse: !!process.env.WAPULSE_TOKEN && !!process.env.WAPULSE_INSTANCE_ID,
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Chat API called');

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OPENAI_API_KEY');
      return new Response(JSON.stringify({ 
        error: 'Missing OPENAI_API_KEY environment variable' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, threadId, resourceId } = await req.json();
    console.log('📨 Request data:', { 
      messageCount: messages?.length, 
      threadId: threadId?.slice(0, 8), 
      resourceId: resourceId?.slice(0, 8) 
    });

    // Get the agent from Mastra
    const agent = mastra.getAgent('assistantAgent');
    console.log('🤖 Agent found:', !!agent);

    if (!agent) {
      console.error('❌ Agent not found');
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
      console.error('❌ Invalid message format');
      return new Response('Invalid message format', { status: 400 });
    }

    console.log('💭 User message:', latestMessage.content.slice(0, 100) + '...');

    try {
      console.log('🚀 Starting agent stream...');
      
      // Use the agent's stream method with proper memory configuration
      const streamResult = await agent.stream(latestMessage.content, {
        memory: {
          thread: threadId,
          resource: resourceId,
        },
        onStepFinish: (step) => {
          console.log('🔧 Step finished:', JSON.stringify(step, null, 2));
        },
      });

      console.log('✅ Agent stream created');

      // Create a ReadableStream that formats data according to AI SDK protocol
      const encoder = new TextEncoder();
      let chunkCount = 0;
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            console.log('📡 Starting stream...');
            
            // Stream text content from Mastra agent
            if (streamResult && streamResult.textStream) {
              for await (const chunk of streamResult.textStream) {
                chunkCount++;
                console.log(`📤 Text Chunk ${chunkCount}:`, chunk.slice(0, 50) + '...');
                
                // Format as AI SDK text part: 0:"content"
                const formattedChunk = `0:${JSON.stringify(chunk)}\n`;
                controller.enqueue(encoder.encode(formattedChunk));
              }
            }
            
            console.log(`✅ Stream completed with ${chunkCount} text chunks`);
            
            // Send finish message with proper format
            const finishMessage = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${chunkCount}}}\n`;
            controller.enqueue(encoder.encode(finishMessage));
            
            controller.close();
          } catch (streamError) {
            console.error('❌ Stream error:', streamError);
            
            // Send error message
            const errorMsg = `0:${JSON.stringify(`Error: ${streamError instanceof Error ? streamError.message : 'Unknown streaming error'}`)}\n`;
            controller.enqueue(encoder.encode(errorMsg));
            
            const finishMessage = `d:{"finishReason":"error","usage":{"promptTokens":0,"completionTokens":0}}\n`;
            controller.enqueue(encoder.encode(finishMessage));
            
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'x-vercel-ai-data-stream': 'v1', // This tells AI SDK it's a data stream
        },
      });

    } catch (error) {
      console.error('❌ Agent/Streaming error:', error);
      return new Response(JSON.stringify({ 
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 