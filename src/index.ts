export { createReporter } from './core/reporter.js';
export { normalizeMetric } from './core/normalize-metric.js';
export { createConsoleAdapter } from './adapters/console.js';
export { createAnalyticsAdapter } from './adapters/analytics.js';
export { createHttpAdapter } from './adapters/http.js';
export {
  createWebVitalsSource,
  createWebVitalsSourceFromSubscriptions,
  createBrowserLifecycleBridge,
  defaultBrowserLifecycle,
} from './browser/index.js';
export { createConsoleLogger } from './diagnostics/logger.js';
export type { Logger } from './diagnostics/logger.js';
export type {
  DiagnosticCode,
  DiagnosticEvent,
  DiagnosticLevel,
  DiagnosticListener,
} from './diagnostics/types.js';
export type {
  Adapter,
  AdapterContext,
  DeliveryResult,
  FlushResult,
  LifecycleBridge,
  MetricAttribution,
  NavigationType,
  ReporterConfig,
  ReporterHandle,
  WebVitalMetric,
  WebVitalName,
  WebVitalRating,
  WebVitalsSource,
} from './core/types.js';
export type {
  ConsoleAdapterOptions,
  AnalyticsAdapterOptions,
  HttpAdapterOptions,
} from './adapters/types.js';
