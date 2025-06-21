import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/mastra';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const source = formData.get('source') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    
    // Determine file type based on extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let documentType: 'text' | 'markdown' | 'html' | 'json' = 'text';
    
    switch (fileExtension) {
      case 'md':
      case 'markdown':
        documentType = 'markdown';
        break;
      case 'html':
      case 'htm':
        documentType = 'html';
        break;
      case 'json':
        documentType = 'json';
        break;
      default:
        documentType = 'text';
    }

    // Process document using the agent's document processing tool
    const result = await mastra.agents.assistantAgent.execute({
      messages: [{
        role: 'user',
        content: `Please process this document for RAG storage. Use the document-process tool with the following details:
        - Content: ${content}
        - Title: ${title || file.name}
        - Type: ${documentType}
        - Source: ${source || file.name}
        
        After processing, provide a summary of what was stored.`
      }],
    });

    // Extract the tool result from the agent's response
    const lastMessage = result.messages[result.messages.length - 1];
    
    return NextResponse.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      fileName: file.name,
      fileSize: file.size,
      documentType,
      agentResponse: lastMessage.content,
      result: result,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to return upload form information
export async function GET() {
  return NextResponse.json({
    message: 'Document upload endpoint',
    supportedTypes: ['text', 'markdown', 'html', 'json'],
    supportedExtensions: ['.txt', '.md', '.markdown', '.html', '.htm', '.json'],
    maxFileSize: '10MB',
    usage: 'POST multipart/form-data with file, title (optional), and source (optional) fields'
  });
} 