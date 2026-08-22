import type { Adapter } from '../core/types.js';
import { createConsoleLogger, type Logger } from '../diagnostics/logger.js';
import type { ConsoleAdapterOptions } from './types.js';

export const createConsoleAdapter = (options: ConsoleAdapterOptions = {}): Adapter => {
  const logger: Logger = options.logger ?? createConsoleLogger('INFO');
  return {
    name: options.name ?? 'console',
    handle(metric) {
      logger.log({
        level: 'INFO',
        code: 'METRIC_REPORTED',
        metric: metric.name,
        message: `${metric.name}:${metric.rating}`,
      });
    },
    flush: () => Promise.resolve({ ok: true, sent: 0, failed: 0, dropped: 0 }),
  };
};
