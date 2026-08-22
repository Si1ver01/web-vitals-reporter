import type { DiagnosticEvent } from '../diagnostics/types.js';
import type { WebVitalMetric, WebVitalName } from '../core/types.js';

export interface VitalSubscription {
  readonly subscribe: (
    callback: (metric: WebVitalMetric) => void,
    options: { readonly reportAllChanges: boolean },
  ) => void;
  readonly name: WebVitalName;
}

export const createSubscriptionRegistry = (subscriptions: readonly VitalSubscription[]) => {
  let generation = 0;
  let active = false;
  return {
    start(
      callback: (metric: WebVitalMetric) => void,
      onDiagnostic: (event: DiagnosticEvent) => void,
      options: { readonly metrics: readonly WebVitalName[]; readonly reportAllChanges: boolean },
    ) {
      if (active) return;
      active = true;
      const current = ++generation;
      const guarded = (metric: WebVitalMetric) => {
        if (!active || current !== generation) {
          onDiagnostic({ level: 'WARN', code: 'LATE_EVENT', metric: metric.name });
          return;
        }
        callback(metric);
      };
      for (const subscription of subscriptions) {
        if (!options.metrics.includes(subscription.name)) continue;
        try {
          subscription.subscribe(guarded, { reportAllChanges: options.reportAllChanges });
        } catch {
          onDiagnostic({
            level: 'ERROR',
            code: 'CAPABILITY_UNAVAILABLE',
            metric: subscription.name,
          });
        }
      }
    },
    stop() {
      active = false;
      generation += 1;
    },
  };
};
