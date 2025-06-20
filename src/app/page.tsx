import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <span className="text-2xl font-bold">+</span>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mastra AI
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">GalAgent</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
            A powerful AI assistant built with Mastra that remembers conversations and learns about users over time using working memory per user features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              🧠 Working Memory
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Maintains persistent memory about each user across conversations, storing preferences, goals, and context.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              🔍 Semantic Recall
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Searches through conversation history to find relevant context and provides context-aware responses.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              🛠️ Tool Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Web search and calculator capabilities that extend the agent's ability to help with real-world tasks.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              💬 Multi-Interface
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Available through terminal CLI, Mastra dev server, or integrate into your Next.js application.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="http://localhost:4111"
            target="_blank"
            rel="noopener noreferrer"
          >
            🚀 Open Mastra Dev Server
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://mastra.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Read Docs
          </a>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl">
          <h3 className="text-lg font-semibold mb-3">Quick Start Commands</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="bg-black dark:bg-gray-800 text-green-400 p-2 rounded">
              <span className="text-gray-500"># Terminal Agent</span><br />
              pnpm run agent:chat
            </div>
            <div className="bg-black dark:bg-gray-800 text-green-400 p-2 rounded">
              <span className="text-gray-500"># Mastra Dev Server</span><br />
              pnpm run mastra:dev
            </div>
            <div className="bg-black dark:bg-gray-800 text-green-400 p-2 rounded">
              <span className="text-gray-500"># Next.js Development</span><br />
              pnpm run dev
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Using special working memory per user versions:</p>
          <p className="font-mono">@mastra/core@0.0.0-working-memory-per-user-20250620163010</p>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://mastra.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Mastra.ai →
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://mastra.ai/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Documentation →
        </a>
      </footer>
    </div>
  );
}
