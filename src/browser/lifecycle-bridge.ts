import type { LifecycleBridge } from '../core/types.js';

export interface LifecycleTarget {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

export const createBrowserLifecycleBridge = (target?: LifecycleTarget): LifecycleBridge => ({
  attach(onFlush) {
    if (!target) return () => undefined;
    const pagehide = () => onFlush('pagehide');
    const visibility = () => onFlush('visibilitychange');
    target.addEventListener('pagehide', pagehide);
    target.addEventListener('visibilitychange', visibility);
    return () => {
      target.removeEventListener('pagehide', pagehide);
      target.removeEventListener('visibilitychange', visibility);
    };
  },
});

export const defaultBrowserLifecycle = (): LifecycleBridge | undefined => {
  if (typeof globalThis.addEventListener !== 'function') return undefined;
  return createBrowserLifecycleBridge(globalThis);
};
