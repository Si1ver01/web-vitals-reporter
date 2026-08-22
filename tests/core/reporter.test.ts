import { describe, expect, it, vi } from 'vitest';
import { createReporter, normalizeMetric } from '../../src/index.js';

const metric = {
  name: 'LCP',
  value: 1200,
  delta: 1200,
  id: 'v1',
  rating: 'good',
  navigationType: 'navigate',
};

describe('metric core', () => {
  it('normalizes safe scalar metrics and rejects invalid values', () => {
    expect(
      normalizeMetric({
        ...metric,
        entries: [{ secret: true }],
        navigationURL: 'https://x.test/?token=1',
      }),
    ).toEqual(metric);
    expect(normalizeMetric({ ...metric, value: Number.NaN })).toBeUndefined();
    expect(normalizeMetric({ ...metric, name: 'FID' })).toBeUndefined();
  });

  it('isolates adapters and enforces lifecycle', async () => {
    const first = vi.fn();
    const second = vi.fn(() => {
      throw new Error('adapter');
    });
    const diagnostics = vi.fn();
    const reporter = createReporter({
      adapters: [
        { name: 'first', handle: first },
        { name: 'second', handle: second },
      ],
      onDiagnostic: diagnostics,
    });
    expect(reporter.report(metric)).toBe(false);
    reporter.start();
    reporter.start();
    expect(reporter.report(metric)).toBe(true);
    expect(first).toHaveBeenCalledOnce();
    expect(diagnostics).toHaveBeenCalledWith(expect.objectContaining({ code: 'DUPLICATE_START' }));
    await reporter.stop();
    expect(reporter.report(metric)).toBe(false);
    expect(diagnostics).toHaveBeenCalledWith(expect.objectContaining({ code: 'LATE_EVENT' }));
  });
});
