export const hasWebVitalsCapability = (): boolean =>
  typeof globalThis.PerformanceObserver === 'function';
