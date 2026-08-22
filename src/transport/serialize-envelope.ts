import type { WebVitalMetric } from '../core/types.js';

export interface TransportMetric {
  readonly name: string;
  readonly value: number;
  readonly delta: number;
  readonly id: string;
  readonly rating: string;
  readonly navigationType: string;
  readonly timestamp?: number;
  readonly attribution?: Record<string, string>;
}
export interface TransportEnvelope {
  readonly version: 1;
  readonly metrics: readonly TransportMetric[];
}

export const toTransportMetric = (metric: WebVitalMetric): TransportMetric => {
  const result: TransportMetric = {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating: metric.rating,
    navigationType: metric.navigationType,
  };
  if (metric.timestamp !== undefined) return { ...result, timestamp: metric.timestamp };
  return result;
};

export const serializeEnvelope = (metrics: readonly WebVitalMetric[]): string =>
  JSON.stringify({
    version: 1,
    metrics: metrics.map(toTransportMetric),
  } satisfies TransportEnvelope);
