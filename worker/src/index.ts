import { processQueue } from './queue/pollQueue';

async function start() {
  console.log('🚀 Worker started');

  setInterval(async () => {
    await processQueue();
  }, 2000);
}

start().catch(console.error);

