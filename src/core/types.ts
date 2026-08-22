import type { DiagnosticEvent, DiagnosticListener } from '../diagnostics/types.js';

export type WebVitalName = 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor' | 'unknown';
export type NavigationType =
  | 'navigate'
  | 'reload'
  | 'back-forward'
  | 'back_forward'
  | 'back-forward-cache'
  | 'prerender'
  | 'restore'
  | 'soft-navigation'
  | 'unknown';

export interface MetricAttribution {
  readonly interactionTarget?: string;
  readonly interactionType?: string;
  readonly loadState?: string;
  readonly element?: string;
  readonly urlOrigin?: string;
}

export interface WebVitalMetric {
  readonly name: WebVitalName;
  readonly value: number;
  readonly delta: number;
  readonly id: string;
  readonly rating: WebVitalRating;
  readonly navigationType: NavigationType;
  readonly attribution?: MetricAttribution;
  readonly timestamp?: number;
}

export interface DeliveryResult {
  readonly ok: boolean;
  readonly sent: number;
  readonly failed: number;
  readonly dropped: number;
  readonly status?: number;
  readonly code?: string;
}

export interface FlushResult {
  readonly sent: number;
  readonly failed: number;
  readonly dropped: number;
  readonly durationMs: number;
  readonly reason: string;
}

export interface AdapterContext {
  readonly signal?: AbortSignal;
}

export interface Adapter {
  readonly name: string;
  start?: () => void | Promise<void>;
  handle: (metric: WebVitalMetric, context?: AdapterContext) => void | Promise<void>;
  flush?: (context: {
    readonly reason: string;
    readonly signal?: AbortSignal;
  }) => Promise<DeliveryResult>;
  stop?: () => void | Promise<void>;
}

export interface WebVitalsSource {
  readonly subscribe: (
    onMetric: (metric: WebVitalMetric) => void,
    onDiagnostic: (event: DiagnosticEvent) => void,
    options: {
      readonly metrics: readonly WebVitalName[];
      readonly reportAllChanges: boolean;
      readonly generation: number;
    },
  ) => void;
  readonly stop?: () => void;
}

export interface LifecycleBridge {
  attach: (onFlush: (reason: string) => void) => () => void;
}

export interface ReporterConfig {
  readonly adapters?: readonly Adapter[];
  readonly metrics?: readonly WebVitalName[];
  readonly reportAllChanges?: boolean;
  readonly source?: WebVitalsSource;
  readonly lifecycle?: LifecycleBridge;
  readonly onDiagnostic?: DiagnosticListener;
}

export interface ReporterHandle {
  readonly start: () => void;
  readonly stop: (options?: { readonly flush?: boolean }) => Promise<FlushResult | undefined>;
  readonly report: (metric: unknown) => boolean;
  readonly flush: (options?: {
    readonly reason?: string;
    readonly signal?: AbortSignal;
  }) => Promise<FlushResult>;
  readonly state: () => 'idle' | 'running' | 'stopped';
}
