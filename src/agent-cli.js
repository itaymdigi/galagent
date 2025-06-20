import { maskStreamTags } from '@mastra/core/utils';
import chalk from 'chalk';
import { randomUUID } from 'crypto';
import ora from 'ora';
import readline from 'readline';
import 'dotenv/config';

import { mastra } from './mastra/index.js';

const agent = mastra.getAgent('assistantAgent');

// Generate unique IDs for this session
let threadId = randomUUID();
const resourceId = 'user_' + randomUUID().slice(0, 8); // Shorter user ID

console.log(chalk.blue.bold('🤖 Personal Assistant with Memory'));
console.log(chalk.gray(`Session ID: ${resourceId}`));
console.log(chalk.gray(`Thread ID: ${threadId.slice(0, 8)}...`));
console.log(chalk.gray('Type "exit" to quit, "new" for new conversation\n'));

async function logResponse(response) {
  console.log(chalk.green.bold('\n🤖 Assistant:'));
  let message = '';

  const memorySpinner = ora('💾 Saving to memory');

  // Mask working memory updates to show spinner
  const maskedStream = maskStreamTags(response.textStream, 'working_memory', {
    onStart: () => {
      memorySpinner.start();
      process.stdin.pause(); // Pause input while saving memory
    },
    onEnd: () => {
      if (memorySpinner.isSpinning) {
        memorySpinner.succeed('💾 Memory updated');
        process.stdin.resume(); // Resume input
      }
    },
  });

  for await (const chunk of maskedStream) {
    process.stdout.write(chunk);
    message += chunk;
  }

  console.log('\n'); // Add spacing after response
  return message;
}

async function main() {
  // Check if this is a returning user by looking for existing threads
  const isFirstChat = Boolean(await agent.getMemory()?.getThreadById({ threadId })) === false;

  // Start the conversation
  await logResponse(
    await agent.stream(
      [
        {
          role: 'system',
          content: !isFirstChat
            ? `Chat resumed at ${new Date().toISOString()}. The user has returned to continue the conversation.`
            : `New chat session started at ${new Date().toISOString()}. This is the user's first interaction.`,
        },
      ],
      {
        memory: {
          thread: threadId,
          resource: resourceId,
        },
      }
    )
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const answer = await new Promise((resolve) => {
      rl.question(chalk.cyan.bold('\n👤 You: '), (answer) => {
        setImmediate(() => resolve(answer));
      });
    });

    // Handle special commands
    if (answer.toLowerCase() === 'exit') {
      console.log(chalk.yellow('\n👋 Goodbye! Your conversation has been saved.'));
      rl.close();
      process.exit(0);
    }

    if (answer.toLowerCase() === 'new') {
      threadId = randomUUID();
      console.log(chalk.blue(`\n🔄 Started new conversation (Thread: ${threadId.slice(0, 8)}...)`));
      
      await logResponse(
        await agent.stream(
          [
            {
              role: 'system',
              content: `New conversation thread started at ${new Date().toISOString()}.`,
            },
          ],
          {
            memory: {
              thread: threadId,
              resource: resourceId,
            },
          }
        )
      );
      continue;
    }

    // Send user message to agent
    await logResponse(
      await agent.stream(answer, {
        memory: {
          thread: threadId,
          resource: resourceId,
        },
      })
    );
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye! Your conversation has been saved.'));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red('❌ Error:'), error);
  process.exit(1);
}); 