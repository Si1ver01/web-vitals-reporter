import { createConsoleAdapter, createReporter, createWebVitalsSource } from 'web-vitals-reporter';

const reporter = createReporter({
  source: createWebVitalsSource(),
  adapters: [createConsoleAdapter()],
});
reporter.start();
