import type { Adapter, DeliveryResult, WebVitalMetric } from '../core/types.js';
import type { Logger } from '../diagnostics/logger.js';

export interface ConsoleAdapterOptions {
  readonly logger?: Logger;
  readonly name?: string;
}
export interface AnalyticsAdapterOptions {
  readonly callback: (metric: WebVitalMetric) => void | Promise<void>;
  readonly name?: string;
}
export interface HttpAdapterOptions {
  readonly endpoint: string;
  readonly method?: 'POST' | 'PUT' | 'PATCH';
  readonly headers?: Readonly<Record<string, string>>;
  readonly batch?: {
    readonly maxBatchSize?: number;
    readonly maxQueueSize?: number;
    readonly flushInterval?: number;
    readonly maxBodyBytes?: number;
  };
  readonly timeout?: number;
  readonly fetch?: typeof globalThis.fetch;
  readonly sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
  readonly baseUrl?: string;
}
export type ReporterAdapter = Adapter;
export type Delivery = DeliveryResult;
