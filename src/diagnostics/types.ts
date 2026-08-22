export type DiagnosticLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type DiagnosticCode =
  | 'UNSUPPORTED_METRIC'
  | 'INVALID_METRIC'
  | 'CAPABILITY_UNAVAILABLE'
  | 'DUPLICATE_START'
  | 'LATE_EVENT'
  | 'ADAPTER_ERROR'
  | 'QUEUE_OVERFLOW'
  | 'TRANSPORT_ERROR'
  | 'INVALID_ENDPOINT'
  | 'PAYLOAD_TOO_LARGE'
  | 'METRIC_REPORTED';

export interface DiagnosticEvent {
  readonly level: DiagnosticLevel;
  readonly code: DiagnosticCode;
  readonly message?: string;
  readonly adapter?: string;
  readonly metric?: string;
  readonly count?: number;
}

export type DiagnosticListener = (event: DiagnosticEvent) => void;
