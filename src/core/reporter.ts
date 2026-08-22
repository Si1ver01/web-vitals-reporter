import { diagnostic } from '../diagnostics/create-diagnostic.js';
import { normalizeMetric } from './normalize-metric.js';
import type {
  FlushResult,
  ReporterConfig,
  ReporterHandle,
  WebVitalMetric,
  WebVitalName,
} from './types.js';

const defaultMetrics: readonly WebVitalName[] = ['CLS', 'INP', 'LCP', 'FCP', 'TTFB'];

export const createReporter = (config: ReporterConfig = {}): ReporterHandle => {
  const adapters = [...(config.adapters ?? [])];
  const metrics = config.metrics?.length ? [...config.metrics] : [...defaultMetrics];
  let state: 'idle' | 'running' | 'stopped' = 'idle';
  let generation = 0;
  let detachLifecycle: () => void = () => undefined;
  const emit = (event: Parameters<NonNullable<ReporterConfig['onDiagnostic']>>[0]) => {
    try {
      config.onDiagnostic?.(event);
    } catch {
      /* diagnostic observers are isolated */
    }
  };
  const dispatch = (metric: WebVitalMetric) => {
    if (state !== 'running') {
      emit(diagnostic('WARN', 'LATE_EVENT', { metric: metric.name }));
      return false;
    }
    for (const adapter of adapters) {
      try {
        Promise.resolve(adapter.handle(metric)).catch(() =>
          emit(
            diagnostic('ERROR', 'ADAPTER_ERROR', { adapter: adapter.name, metric: metric.name }),
          ),
        );
      } catch {
        emit(diagnostic('ERROR', 'ADAPTER_ERROR', { adapter: adapter.name, metric: metric.name }));
      }
    }
    return true;
  };
  const flush = async (
    options: { readonly reason?: string; readonly signal?: AbortSignal } = {},
  ): Promise<FlushResult> => {
    const started = Date.now();
    const reason = options.reason ?? 'manual';
    let sent = 0;
    let failed = 0;
    let dropped = 0;
    for (const adapter of adapters) {
      if (!adapter.flush) continue;
      try {
        const context = options.signal ? { reason, signal: options.signal } : { reason };
        const result = await adapter.flush(context);
        sent += result.sent;
        failed += result.failed;
        dropped += result.dropped;
      } catch {
        failed += 1;
        emit(diagnostic('ERROR', 'ADAPTER_ERROR', { adapter: adapter.name }));
      }
    }
    return { sent, failed, dropped, durationMs: Date.now() - started, reason };
  };
  return {
    start() {
      if (state === 'running') {
        emit(diagnostic('WARN', 'DUPLICATE_START'));
        return;
      }
      state = 'running';
      generation += 1;
      for (const adapter of adapters) {
        try {
          void adapter.start?.();
        } catch {
          emit(diagnostic('ERROR', 'ADAPTER_ERROR', { adapter: adapter.name }));
        }
      }
      detachLifecycle();
      detachLifecycle =
        config.lifecycle?.attach((reason) => {
          void flush({ reason });
        }) ?? (() => undefined);
      if (config.source)
        config.source.subscribe(
          (metric) => {
            if (generation > 0) dispatch(metric);
          },
          emit,
          { metrics, reportAllChanges: config.reportAllChanges ?? false, generation },
        );
    },
    async stop(options = {}) {
      if (state !== 'running') {
        emit(diagnostic('WARN', 'LATE_EVENT'));
        return undefined;
      }
      state = 'stopped';
      generation += 1;
      detachLifecycle();
      detachLifecycle = () => undefined;
      config.source?.stop?.();
      const result = options.flush ? await flush({ reason: 'stop' }) : undefined;
      for (const adapter of adapters) {
        try {
          await adapter.stop?.();
        } catch {
          emit(diagnostic('ERROR', 'ADAPTER_ERROR', { adapter: adapter.name }));
        }
      }
      return result;
    },
    report(metric) {
      const normalized = normalizeMetric(metric);
      if (!normalized) {
        emit(diagnostic('WARN', 'INVALID_METRIC'));
        return false;
      }
      return dispatch(normalized);
    },
    flush,
    state: () => state,
  };
};
