'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import Image from "next/image";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      threadId,
      resourceId,
    },
    initialMessages: [],
    id: threadId, // This helps prevent duplicate chat instances
  });

  // Mark as initialized after hydration
  useEffect(() => {
    if (threadId && resourceId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [threadId, resourceId, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
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
        case 'webSearch': return '🌐';
        case 'webScrape': return '🔍';
        case 'calculator': return '🧮';
        case 'knowledgeSearch': return '📚';
        default: return '🔧';
      }
    };

    const getToolName = (toolName: string) => {
      switch (toolName) {
        case 'webSearch': return 'Web Search';
        case 'webScrape': return 'Web Scraping';
        case 'calculator': return 'Calculator';
        case 'knowledgeSearch': return 'Knowledge Search';
        default: return toolName;
      }
    };

    return (
      <div key={tool.toolCallId} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
          <span>{getToolIcon(tool.toolName)}</span>
          <span>{getToolName(tool.toolName)}</span>
        </div>
        
        {/* Tool Arguments */}
        <div className="text-xs text-gray-600 mb-2">
          {Object.entries(tool.args).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>

        {/* Tool Result */}
        {tool.result && (
          <div className="bg-white rounded p-2 text-sm">
            <div className="font-medium text-gray-700 mb-1">Result:</div>
            <pre className="whitespace-pre-wrap text-gray-600">
              {typeof tool.result === 'object' 
                ? JSON.stringify(tool.result, null, 2) 
                : String(tool.result)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Gal Agent</h1>
              <p className="text-sm text-gray-500">AI Assistant with Web Search, Scraping & Memory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Welcome Message - only show after initialization */}
          {isInitialized && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <div className="text-gray-800">
                  👋 Hi! I'm <strong>Gal Agent</strong>, your intelligent AI assistant with powerful capabilities:
                  <br /><br />
                  🌐 <strong>Web Search</strong> - I can search the internet for current information<br />
                  🔍 <strong>Web Scraping</strong> - Extract and analyze content from any webpage<br />
                  🧮 <strong>Calculations</strong> - Perform complex mathematical calculations<br />
                  🧠 <strong>Memory</strong> - Remember our conversations and your preferences<br />
                  📚 <strong>Knowledge Search</strong> - Find information from our past discussions
                  <br /><br />
                  What would you like to explore today?
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {/* Tool Invocations */}
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className="mb-3">
                    {message.toolInvocations.map(renderToolInvocation)}
                  </div>
                )}

                {/* Message Content */}
                <div
                  className={`${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(message.content),
                  }}
                />

                {/* Timestamp */}
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {message.createdAt?.toLocaleTimeString()}
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

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask Gal Agent anything... (try: search for AI news, scrape a website, or do some math)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Bottom padding to prevent content from being hidden behind fixed input */}
      <div className="h-24"></div>
    </div>
  );
}
