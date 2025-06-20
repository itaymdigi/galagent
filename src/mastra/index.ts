import { Mastra } from '@mastra/core';
import { assistantAgent } from './agents/index';
import { createProductionStorage, productionConfig } from './config/production';

// Configure storage for persistence (production-ready)
const { storage } = createProductionStorage();

// Initialize Mastra with our agent and storage
export const mastra = new Mastra({
  agents: { 
    assistantAgent 
  },
  storage,
  logger: productionConfig.logging.enabled ? undefined : false, // Use production logging config
}); 