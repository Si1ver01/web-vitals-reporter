import type { FlushResult, WebVitalMetric } from '../core/types.js';
import { systemClock, type Clock } from './clock.js';
import type { Queue, QueueOptions } from './types.js';

export const createMetricQueue = (options: QueueOptions): Queue => {
  const maxBatchSize = Math.max(1, options.maxBatchSize ?? 10);
  const maxQueueSize = Math.max(maxBatchSize, options.maxQueueSize ?? 100);
  const clock: Clock = options.clock ?? systemClock;
  const queue: WebVitalMetric[] = [];
  let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  let active: Promise<FlushResult> | undefined;
  let started = false;

  const clear = () => {
    if (timer !== undefined) {
      clock.clearTimeout(timer);
      timer = undefined;
    }
  };
  const schedule = () => {
    clear();
    if (started && options.flushInterval && options.flushInterval > 0)
      timer = clock.setTimeout(() => {
        void flush('interval');
      }, options.flushInterval);
  };
  const flush = (reason: string, signal?: AbortSignal): Promise<FlushResult> => {
    if (active) return active;
    const startedAt = clock.now();
    const batches: WebVitalMetric[][] = [];
    while (queue.length) batches.push(queue.splice(0, maxBatchSize));
    if (!batches.length)
      return Promise.resolve({ sent: 0, failed: 0, dropped: 0, durationMs: 0, reason });
    active = (async () => {
      let sent = 0;
      let failed = 0;
      let dropped = 0;
      for (const batch of batches) {
        if (signal?.aborted) {
          dropped += batch.length;
          continue;
        }
        try {
          const result = await options.deliver(batch, signal ? { reason, signal } : { reason });
          sent += result.sent;
          failed += result.failed;
          dropped += result.dropped;
        } catch {
          failed += batch.length;
        }
      }
      return { sent, failed, dropped, durationMs: Math.max(0, clock.now() - startedAt), reason };
    })();
    void active.finally(() => {
      active = undefined;
      if (queue.length > 0) void flush(queue.length >= maxBatchSize ? 'batch' : 'pending');
      else schedule();
    });
    return active;
  };
  return {
    enqueue(metric) {
      if (queue.length >= maxQueueSize) {
        queue.shift();
        options.onOverflow?.(1);
      }
      queue.push(metric);
      if (queue.length >= maxBatchSize) {
        void flush('batch');
      } else schedule();
      return queue.length;
    },
    flush,
    start() {
      started = true;
      schedule();
    },
    stop() {
      started = false;
      clear();
    },
  };
};
