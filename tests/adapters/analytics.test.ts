import { describe, expect, it, vi } from 'vitest';
import { createAnalyticsAdapter } from '../../src/index.js';

const metric = {
  name: 'CLS' as const,
  value: 0.1,
  delta: 0.1,
  id: 'cls-1',
  rating: 'good' as const,
  navigationType: 'navigate' as const,
};

describe('analytics adapter', () => {
  it('isolates rejected callbacks through reporter diagnostics', async () => {
    const callback = vi.fn().mockRejectedValue(new Error('sink failure'));
    const adapter = createAnalyticsAdapter({ callback });
    await expect(adapter.handle(metric)).rejects.toThrow('ADAPTER_ERROR');
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ name: 'CLS' }));
  });
});
