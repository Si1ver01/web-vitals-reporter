import { access, readFile } from 'node:fs/promises';
const required = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'RELEASE_NOTES.md',
  'docs/api.md',
  'docs/architecture.md',
  'docs/adapters.md',
  'docs/privacy.md',
  'docs/delivery.md',
  'examples/vanilla/index.ts',
  'examples/analytics-callback/index.ts',
];
for (const file of required) await access(file);
const readme = await readFile('README.md', 'utf8');
for (const phrase of ['createReporter', 'no-PII', 'npm run verify'])
  if (!readme.includes(phrase)) throw new Error(`docs rule missing: ${phrase}`);
console.log(
  JSON.stringify({ level: 'INFO', message: 'documentation checks passed', pages: required.length }),
);
