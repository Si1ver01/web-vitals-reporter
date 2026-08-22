import type { Adapter, DeliveryResult, WebVitalMetric } from '../core/types.js';
import { createMetricQueue } from '../transport/metric-queue.js';
import { deliverHttp } from '../transport/http-delivery.js';
import { serializeEnvelope } from '../transport/serialize-envelope.js';
import type { HttpAdapterOptions } from './types.js';

const allowedHeaders = new Set(['content-type', 'x-request-id']);

export const createHttpAdapter = (options: HttpAdapterOptions): Adapter => {
  const method = options.method ?? 'POST';
  const endpoint = (() => {
    try {
      return new URL(
        options.endpoint,
        options.baseUrl ??
          (typeof globalThis.location !== 'undefined' ? globalThis.location.href : undefined),
      );
    } catch {
      return undefined;
    }
  })();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...Object.fromEntries(
      Object.entries(options.headers ?? {}).filter(([key]) =>
        allowedHeaders.has(key.toLowerCase()),
      ),
    ),
  };
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const sendBeacon =
    options.sendBeacon ??
    (typeof globalThis.navigator?.sendBeacon === 'function'
      ? globalThis.navigator.sendBeacon.bind(globalThis.navigator)
      : undefined);
  const maxBodyBytes = options.batch?.maxBodyBytes ?? 64 * 1024;
  const queueOptions = {
    maxBatchSize: options.batch?.maxBatchSize ?? 10,
    maxQueueSize: options.batch?.maxQueueSize ?? 100,
    deliver: async (
      batch: readonly WebVitalMetric[],
      context: { readonly reason: string; readonly signal?: AbortSignal },
    ): Promise<DeliveryResult> => {
      if (!endpoint)
        return { ok: false, sent: 0, failed: batch.length, dropped: 0, code: 'INVALID_ENDPOINT' };
      const body = serializeEnvelope(batch);
      if (new TextEncoder().encode(body).byteLength > maxBodyBytes)
        return { ok: false, sent: 0, failed: 0, dropped: batch.length, code: 'PAYLOAD_TOO_LARGE' };
      if (context.reason === 'pagehide' && method === 'POST' && sendBeacon && endpoint) {
        const accepted = sendBeacon(
          endpoint.toString(),
          new Blob([body], { type: 'application/json' }),
        );
        return accepted
          ? { ok: true, sent: batch.length, failed: 0, dropped: 0 }
          : { ok: false, sent: 0, failed: batch.length, dropped: 0, code: 'BEACON_REJECTED' };
      }
      if (!fetchImpl)
        return { ok: false, sent: 0, failed: batch.length, dropped: 0, code: 'FETCH_UNAVAILABLE' };
      const deliveryOptions = {
        endpoint: endpoint.toString(),
        method,
        headers,
        body,
        fetch: fetchImpl,
        timeout: options.timeout ?? 5000,
      };
      if (context.signal) Object.assign(deliveryOptions, { signal: context.signal });
      return deliverHttp(deliveryOptions);
    },
  };
  if (options.batch?.flushInterval !== undefined)
    Object.assign(queueOptions, { flushInterval: options.batch.flushInterval });
  const queue = createMetricQueue(queueOptions);
  return {
    name: 'http',
    start: () => queue.start(),
    handle: (metric) => {
      queue.enqueue(metric);
    },
    flush: async (context) => {
      const result = await queue.flush(context.reason, context.signal);
      return {
        ok: result.failed === 0,
        sent: result.sent,
        failed: result.failed,
        dropped: result.dropped,
      };
    },
    stop: () => queue.stop(),
  };
};
