import type { DiagnosticCode, DiagnosticEvent, DiagnosticLevel } from './types.js';

export const diagnostic = (
  level: DiagnosticLevel,
  code: DiagnosticCode,
  fields: Omit<DiagnosticEvent, 'level' | 'code'> = {},
): DiagnosticEvent => ({ level, code, ...fields });
