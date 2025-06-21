import { NextRequest, NextResponse } from 'next/server';

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

    // For now, just return the file information without processing
    // This removes the RAG dependency that was causing build errors
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileName: file.name,
      fileSize: file.size,
      documentType,
      title: title || file.name,
      source: source || 'upload',
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      note: 'Document processing capabilities will be available once RAG dependencies are resolved'
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