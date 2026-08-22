import type { LifecycleBridge } from '../core/types.js';

export const createFlushPolicy = (
  lifecycle: LifecycleBridge | undefined,
  flush: (reason: string) => void,
): (() => void) => lifecycle?.attach(flush) ?? (() => undefined);
