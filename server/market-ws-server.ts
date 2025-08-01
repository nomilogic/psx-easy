#!/usr/bin/env node

import { MarketWebSocketServer } from './websocket-server';

const server = new MarketWebSocketServer();
const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;

async function main() {
  try {
    await server.start(PORT);
  } catch (error) {
    console.error('Failed to start Market WebSocket server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

main();