import type { Adapter } from '../core/types.js';
import { diagnostic } from '../diagnostics/create-diagnostic.js';
import type { AnalyticsAdapterOptions } from './types.js';

export const createAnalyticsAdapter = (options: AnalyticsAdapterOptions): Adapter => ({
  name: options.name ?? 'analytics',
  async handle(metric) {
    try {
      await options.callback(Object.freeze({ ...metric }));
    } catch {
      throw new Error(
        diagnostic('ERROR', 'ADAPTER_ERROR', {
          adapter: options.name ?? 'analytics',
          metric: metric.name,
        }).code,
      );
    }
  },
  flush: () => Promise.resolve({ ok: true, sent: 0, failed: 0, dropped: 0 }),
});
