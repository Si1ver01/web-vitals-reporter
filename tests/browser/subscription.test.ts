import { describe, expect, it, vi } from 'vitest';
import { createWebVitalsSourceFromSubscriptions } from '../../src/browser/web-vitals-source.js';

const rawMetric = {
  name: 'LCP' as const,
  value: 900,
  delta: 900,
  id: 'lcp-1',
  rating: 'good' as const,
  navigationType: 'navigate' as const,
  entries: [],
};

describe('web-vitals source', () => {
  it('normalizes callbacks and suppresses late events after stop', () => {
    let callback: ((metric: typeof rawMetric) => void) | undefined;
    const source = createWebVitalsSourceFromSubscriptions([
      {
        name: 'LCP',
        subscribe: (next) => {
          callback = next;
        },
      },
    ]);
    const received = vi.fn();
    const diagnostics = vi.fn();
    source.subscribe(received, diagnostics, {
      metrics: ['LCP'],
      reportAllChanges: true,
      generation: 1,
    });
    callback?.(rawMetric);
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ name: 'LCP', value: 900 }));
    source.stop?.();
    callback?.(rawMetric);
    expect(diagnostics).toHaveBeenCalledWith(expect.objectContaining({ code: 'LATE_EVENT' }));
  });
});
