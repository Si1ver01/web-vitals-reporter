import { describe, expect, it, vi } from 'vitest';
import { createHttpAdapter } from '../../src/index.js';

const metric = {
  name: 'TTFB' as const,
  value: 100,
  delta: 100,
  id: 'ttfb-1',
  rating: 'good' as const,
  navigationType: 'navigate' as const,
};

describe('http adapter', () => {
  it('uses beacon for pagehide POST delivery without credentials', async () => {
    const beacon = vi.fn<(url: string, data?: BodyInit | null) => boolean>(() => true);
    const fetch = vi.fn();
    const adapter = createHttpAdapter({
      endpoint: 'https://rum.example.test/vitals',
      sendBeacon: beacon,
      fetch,
    });
    await adapter.start?.();
    await adapter.handle(metric);
    const result = await adapter.flush?.({ reason: 'pagehide' });
    expect(result?.sent).toBe(1);
    expect(beacon).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
    expect(beacon.mock.calls[0]?.[1]).toBeInstanceOf(Blob);
  });
});
