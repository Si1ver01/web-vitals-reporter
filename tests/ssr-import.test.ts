import { describe, expect, it } from 'vitest';

describe('SSR import', () => {
  it('imports without browser globals', async () => {
    const api = await import('../src/index.js');
    expect(api.createReporter).toBeTypeOf('function');
    expect(api.createHttpAdapter).toBeTypeOf('function');
  });
});
