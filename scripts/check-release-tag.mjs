import { readFile } from 'node:fs/promises';
import process from 'node:process';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const tag = process.argv[2] ?? process.env.RELEASE_TAG;
if (tag && tag !== `v${pkg.version}`) {
  console.error(JSON.stringify({ level: 'ERROR', code: 'RELEASE_TAG_MISMATCH' }));
  process.exit(1);
}
console.log(
  JSON.stringify({ level: 'INFO', message: 'release tag check passed', version: pkg.version }),
);
