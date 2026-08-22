import type { DiagnosticEvent, DiagnosticLevel } from './types.js';

const rank: Record<DiagnosticLevel, number> = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };

export interface Logger {
  readonly level?: DiagnosticLevel;
  readonly log: (event: DiagnosticEvent) => void;
}

export const createConsoleLogger = (level: DiagnosticLevel = 'INFO'): Logger => ({
  level,
  log: (event) => {
    if (rank[event.level] < rank[level]) return;
    const method = event.level === 'ERROR' ? 'error' : event.level === 'WARN' ? 'warn' : 'log';
    globalThis.console?.[method]?.({
      level: event.level,
      code: event.code,
      adapter: event.adapter,
      metric: event.metric,
      count: event.count,
    });
  },
});
