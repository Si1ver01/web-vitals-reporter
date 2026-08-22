import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric as VitalMetric } from 'web-vitals';
import { normalizeMetric } from '../core/normalize-metric.js';
import type { WebVitalMetric, WebVitalName, WebVitalsSource } from '../core/types.js';
import { createSubscriptionRegistry } from './subscription-registry.js';

const mapMetric = (metric: VitalMetric): WebVitalMetric | undefined =>
  normalizeMetric({
    ...metric,
    navigationType:
      metric.navigationType === 'back-forward-cache' ? 'back-forward' : metric.navigationType,
  });

export const createWebVitalsSource = (): WebVitalsSource => {
  const wrap = (
    name: WebVitalName,
    subscribe: (
      callback: (metric: VitalMetric) => void,
      options?: { reportAllChanges?: boolean },
    ) => void,
  ) => ({
    name,
    subscribe: (
      callback: (metric: WebVitalMetric) => void,
      options: { reportAllChanges: boolean },
    ) =>
      subscribe((raw) => {
        const normalized = mapMetric(raw);
        if (normalized) callback(normalized);
      }, options),
  });
  const subscriptions = [
    wrap('CLS', onCLS),
    wrap('INP', onINP),
    wrap('LCP', onLCP),
    wrap('FCP', onFCP),
    wrap('TTFB', onTTFB),
  ];
  const registry = createSubscriptionRegistry(subscriptions);
  return {
    subscribe(onMetric, onDiagnostic, options) {
      registry.start(onMetric, onDiagnostic, options);
    },
    stop: () => registry.stop(),
  };
};

export const createWebVitalsSourceFromSubscriptions = (
  subscriptions: readonly {
    name: WebVitalName;
    subscribe: (
      callback: (metric: VitalMetric) => void,
      options: { reportAllChanges?: boolean },
    ) => void;
  }[],
): WebVitalsSource => {
  const registry = createSubscriptionRegistry(
    subscriptions.map((item) => ({
      name: item.name,
      subscribe: (callback, options) =>
        item.subscribe((metric) => {
          const normalized = mapMetric(metric);
          if (normalized) callback(normalized);
        }, options),
    })),
  );
  return {
    subscribe(onMetric, onDiagnostic, options) {
      registry.start(onMetric, onDiagnostic, options);
    },
    stop: () => registry.stop(),
  };
};
