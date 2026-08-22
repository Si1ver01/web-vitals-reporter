import type { NavigationType, WebVitalMetric, WebVitalName, WebVitalRating } from './types.js';

const names = new Set<WebVitalName>(['CLS', 'INP', 'LCP', 'FCP', 'TTFB']);
const ratings = new Set<WebVitalRating>(['good', 'needs-improvement', 'poor', 'unknown']);
const navigationTypes = new Set<NavigationType>([
  'navigate',
  'reload',
  'back-forward',
  'back_forward',
  'back-forward-cache',
  'prerender',
  'restore',
  'soft-navigation',
  'unknown',
]);

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const normalizeMetric = (input: unknown): WebVitalMetric | undefined => {
  if (!input || typeof input !== 'object') return undefined;
  const value = input as Record<string, unknown>;
  if (
    !names.has(value.name as WebVitalName) ||
    !finite(value.value) ||
    !finite(value.delta) ||
    typeof value.id !== 'string' ||
    value.id.trim() === ''
  )
    return undefined;
  const navigationType = navigationTypes.has(value.navigationType as NavigationType)
    ? (value.navigationType as NavigationType)
    : 'unknown';
  const rating = ratings.has(value.rating as WebVitalRating)
    ? (value.rating as WebVitalRating)
    : 'unknown';
  const result: WebVitalMetric = {
    name: value.name as WebVitalName,
    value: value.value,
    delta: value.delta,
    id: value.id,
    rating,
    navigationType,
  };
  if (finite(value.timestamp)) return { ...result, timestamp: value.timestamp };
  return result;
};
