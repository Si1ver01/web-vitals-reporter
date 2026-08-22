import type { DeliveryResult, FlushResult, WebVitalMetric } from '../core/types.js';
import type { Clock } from './clock.js';

export interface QueueOptions {
  readonly maxBatchSize?: number;
  readonly maxQueueSize?: number;
  readonly flushInterval?: number;
  readonly clock?: Clock;
  readonly deliver: (
    batch: readonly WebVitalMetric[],
    context: { readonly reason: string; readonly signal?: AbortSignal },
  ) => Promise<DeliveryResult>;
  readonly onOverflow?: (count: number) => void;
}

export interface Queue {
  enqueue: (metric: WebVitalMetric) => number;
  flush: (reason: string, signal?: AbortSignal) => Promise<FlushResult>;
  start: () => void;
  stop: () => void;
}
