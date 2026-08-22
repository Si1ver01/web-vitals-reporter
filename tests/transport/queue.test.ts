import { describe, expect, it } from 'vitest';
import { createMetricQueue } from '../../src/transport/metric-queue.js';

const metric = (id: string) => ({
  name: 'CLS' as const,
  value: 0,
  delta: 0,
  id,
  rating: 'good' as const,
  navigationType: 'navigate' as const,
});

describe('metric queue', () => {
  it('flushes FIFO batches and bounds memory', async () => {
    const batches: string[][] = [];
    const queue = createMetricQueue({
      maxBatchSize: 2,
      maxQueueSize: 2,
      deliver: (batch) => {
        batches.push(batch.map((item) => item.id));
        return Promise.resolve({ ok: true, sent: batch.length, failed: 0, dropped: 0 });
      },
    });
    queue.start();
    queue.enqueue(metric('one'));
    queue.enqueue(metric('two'));
    queue.enqueue(metric('three'));
    await queue.flush('manual');
    expect(batches).toEqual([['one', 'two'], ['three']]);
  });
});
