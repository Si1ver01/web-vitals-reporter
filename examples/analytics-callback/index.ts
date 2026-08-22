import { createAnalyticsAdapter, createReporter } from 'web-vitals-reporter';

const reporter = createReporter({
  adapters: [
    createAnalyticsAdapter({ callback: (metric) => console.info(metric.name, metric.value) }),
  ],
});
reporter.start();
