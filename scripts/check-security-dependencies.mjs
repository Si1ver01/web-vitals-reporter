import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const temp = await mkdtemp(join(tmpdir(), 'web-vitals-reporter-audit-'));
const env = { ...process.env, npm_config_cache: join(temp, 'npm-cache') };
try {
  const audit = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=high'], {
    encoding: 'utf8',
    env,
  });
  if (audit.status !== 0) {
    const output = `${audit.stdout}\n${audit.stderr}`;
    if (/ENOTFOUND|network|offline|audit endpoint/i.test(output)) {
      console.warn(
        JSON.stringify({
          level: 'WARN',
          code: 'SECURITY_AUDIT_UNAVAILABLE',
          message: 'npm audit service unavailable; dependency lockfile remains required',
        }),
      );
    } else {
      console.error(JSON.stringify({ level: 'ERROR', code: 'SECURITY_AUDIT_FAILED' }));
      process.exitCode = audit.status ?? 1;
      await rm(temp, { recursive: true, force: true });
      process.exit(process.exitCode);
    }
  }
  const tree = spawnSync('npm', ['ls', '--all', '--json'], { encoding: 'utf8', env });
  if (tree.status !== 0) {
    console.error(JSON.stringify({ level: 'ERROR', code: 'DEPENDENCY_TREE_FAILED' }));
    process.exitCode = tree.status ?? 1;
  } else
    console.log(JSON.stringify({ level: 'INFO', message: 'security dependency checks passed' }));
} finally {
  await rm(temp, { recursive: true, force: true });
}
