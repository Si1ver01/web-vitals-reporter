import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = process.cwd();
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const temp = await mkdtemp(join(tmpdir(), 'web-vitals-reporter-pack-'));
try {
  const { stdout } = await exec('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    env: { ...process.env, npm_config_cache: join(temp, 'npm-cache') },
  });
  const [summary] = JSON.parse(stdout);
  const files = summary?.files?.map(({ path }) => path) ?? [];
  const forbidden = files.filter((file) =>
    /(^|\/)(tests?|\.env|node_modules)(\/|$)|\.map$/.test(file),
  );
  if (forbidden.length) throw new Error(`forbidden package files: ${forbidden.join(', ')}`);
  for (const required of [
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'README.md',
    'LICENSE',
  ])
    if (!files.includes(required)) throw new Error(`missing package file: ${required}`);
  await writeFile(
    join(temp, 'summary.json'),
    JSON.stringify({ name: pkg.name, version: pkg.version, files }, null, 2),
  );
  console.log(
    JSON.stringify({
      level: 'INFO',
      message: 'package check passed',
      name: pkg.name,
      version: pkg.version,
      files: files.length,
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      level: 'ERROR',
      stage: 'pack-check',
      message: error instanceof Error ? error.message : 'package check failed',
    }),
  );
  process.exitCode = 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
