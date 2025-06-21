'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import Image from "next/image";
import ClientOnly from '../components/ClientOnly';
// Temporarily disabled document upload due to RAG dependency issues
// import DocumentUpload from '../components/DocumentUpload';
import { useBrowserExtensionFix } from '../hooks/useBrowserExtensionFix';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: any[];
  timestamp: Date;
}

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string>('');
  const [resourceId, setResourceId] = useState<string>('');
  // Temporarily disabled document upload due to RAG dependency issues
  // const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle browser extension interference
  useBrowserExtensionFix();

  // Initialize IDs only on client side to avoid hydration mismatch
  useEffect(() => {
    if (!threadId) {
      setThreadId(crypto.randomUUID());
    }
    if (!resourceId) {
      setResourceId(`user_${crypto.randomUUID().slice(0, 8)}`);
    }
  }, [threadId, resourceId]);

  const [isInitialized, setIsInitialized] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      threadId,
      resourceId,
    },
    initialMessages: [],
    id: threadId, // This helps prevent duplicate chat instances
    onError: (error) => {
      console.error('❌ Chat error:', error);
    },
    onFinish: (message) => {
      console.log('✅ Chat finished:', message);
    },
    onResponse: (response) => {
      console.log('📡 Response received:', response);
    },
  });

  // Mark as initialized after hydration
  useEffect(() => {
    if (threadId && resourceId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [threadId, resourceId, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('📨 Messages updated:', messages.length, messages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle browser extension interference
  useEffect(() => {
    // Small delay to let extensions add their attributes before React hydrates
    const timer = setTimeout(() => {
      // This helps prevent hydration warnings from browser extensions
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const renderToolInvocation = (tool: any) => {
    const getToolIcon = (toolName: string) => {
      switch (toolName) {
        case 'web-search': return '🌐';
        case 'web-scrape': return '🔍';
        case 'calculator': return '🧮';
        case 'knowledge-search': return '📚';
        case 'whatsapp-send': return '📱';
        case 'scrape-and-send-whatsapp': return '📱🔍';
        case 'validate-phone': return '📞';
        case 'webSearchTool': return '🌐';
        case 'webScrapeTool': return '🔍';
        case 'calculatorTool': return '🧮';
        case 'knowledgeSearchTool': return '📚';
        case 'whatsappSendTool': return '📱';
        case 'scrapeAndSendTool': return '📱🔍';
        case 'validatePhoneTool': return '📞';
        case 'documentProcessTool': return '📄';
        case 'documentSearchTool': return '🔍';
        default: return '🔧';
      }
    };

    const getToolName = (toolName: string) => {
      switch (toolName) {
        case 'web-search': return 'Web Search';
        case 'web-scrape': return 'Web Scraping';
        case 'calculator': return 'Calculator';
        case 'knowledge-search': return 'Knowledge Search';
        case 'whatsapp-send': return 'WhatsApp Send';
        case 'scrape-and-send-whatsapp': return 'Scrape & Send WhatsApp';
        case 'validate-phone': return 'Phone Validation';
        case 'webSearchTool': return 'Web Search';
        case 'webScrapeTool': return 'Web Scraping';
        case 'calculatorTool': return 'Calculator';
        case 'knowledgeSearchTool': return 'Knowledge Search';
        case 'whatsappSendTool': return 'WhatsApp Send';
        case 'scrapeAndSendTool': return 'Scrape & Send WhatsApp';
        case 'validatePhoneTool': return 'Phone Validation';
        case 'documentProcessTool': return 'Document Processing';
        case 'documentSearchTool': return 'Document Search';
        default: return toolName;
      }
    };

    return (
      <div key={tool.toolCallId} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
          <span>{getToolIcon(tool.toolName)}</span>
          <span>{getToolName(tool.toolName)}</span>
          <span className="text-xs text-gray-500">({tool.toolName})</span>
        </div>
        
        {/* Tool Arguments */}
        {tool.args && Object.keys(tool.args).length > 0 && (
          <div className="text-xs text-gray-600 mb-2">
            <div className="font-medium mb-1">Arguments:</div>
            {Object.entries(tool.args).map(([key, value]) => (
              <div key={key} className="ml-2">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}

        {/* Tool Result */}
        {tool.result && (
          <div className="bg-white rounded p-2 text-sm">
            <div className="font-medium text-gray-700 mb-1">Result:</div>
            <div className="text-gray-600">
              {typeof tool.result === 'object' ? (
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(tool.result, null, 2)}
                </pre>
              ) : (
                <div className="whitespace-pre-wrap">
                  {String(tool.result)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4" suppressHydrationWarning>
            G
          </div>
          <div className="text-gray-600" suppressHydrationWarning>Loading Gal Agent...</div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto px-4 py-4" suppressHydrationWarning>
          <div className="flex items-center justify-between" suppressHydrationWarning>
            <div className="flex items-center gap-3" suppressHydrationWarning>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg" suppressHydrationWarning>
                G
              </div>
              <div suppressHydrationWarning>
                <h1 className="text-xl font-bold text-gray-800">Gal Agent</h1>
                <p className="text-sm text-gray-500">AI Assistant with WhatsApp, Web Search & Memory</p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>WhatsApp Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <>
          {/* Chat Messages */}
          <div className="max-w-4xl mx-auto px-4 py-6" suppressHydrationWarning>
            <div className="space-y-6" suppressHydrationWarning>
              {/* Welcome Message - only show after initialization */}
              {isInitialized && messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                    <div className="text-gray-800">
                      👋 Hi! I'm <strong>Gal Agent</strong>, your intelligent AI assistant with powerful capabilities:
                      <br /><br />
                      🌐 <strong>Web Search</strong> - I can search the internet for current information<br />
                      🔍 <strong>Web Scraping</strong> - Extract and analyze content from any webpage<br />
                      📱 <strong>WhatsApp Messaging</strong> - Send messages and scraped content via WhatsApp<br />
                      🧮 <strong>Calculations</strong> - Perform complex mathematical calculations<br />
                      🧠 <strong>Memory</strong> - Remember our conversations and your preferences<br />
                      📚 <strong>Knowledge Search</strong> - Find information from our past discussions
                      <br /><br />
                      <strong>🚀 Try asking me:</strong><br />
                      • "Scrape https://news.ycombinator.com and send it to my WhatsApp"<br />
                      • "Search for the latest AI news and WhatsApp it to me"<br />
                      • "Get content from [any website] and send via WhatsApp"
                      <br /><br />
                      What would you like to explore today?
                    </div>
                  </div>
                </div>
              )}
              


              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-4 py-3 border-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-white text-black border-gray-300 shadow-lg'
                    }`}
                    style={{
                      minHeight: '60px',
                      backgroundColor: message.role === 'user' ? '#3b82f6' : '#ffffff',
                      color: message.role === 'user' ? '#ffffff' : '#000000'
                    }}
                  >


                    {/* Tool Invocations */}
                    {message.toolInvocations && message.toolInvocations.length > 0 && (
                      <div className="mb-3">
                        {message.toolInvocations.map(renderToolInvocation)}
                      </div>
                    )}

                    {/* Message Content - Force visible */}
                    <div
                      className="font-medium"
                      style={{
                        color: message.role === 'user' ? '#ffffff' : '#000000',
                        fontSize: '16px',
                        lineHeight: '1.5'
                      }}
                    >
                      {message.content || 'No content'}
                    </div>



                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.createdAt?.toLocaleTimeString() || 'No timestamp'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span>Gal Agent is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error indicator */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-red-600">
                      <span>❌</span>
                      <span>Error: {error.message}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} suppressHydrationWarning />
            </div>
          </div>

          {/* Input Form - only show for chat tab */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200" suppressHydrationWarning>
            <div className="max-w-4xl mx-auto px-4 py-4" suppressHydrationWarning>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask Gal Agent anything... (try: scrape a website and send to WhatsApp, search for news, or do some math)"
                  className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '16px',
                    border: '2px solid #666666'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </>

        {/* Bottom padding to prevent content from being hidden behind fixed input */}
        <div className="h-24" suppressHydrationWarning></div>
      </div>
    </ClientOnly>
  );
}
