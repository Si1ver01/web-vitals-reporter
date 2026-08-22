import { spawn } from 'node:child_process';
import process from 'node:process';

const names = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
const configured = String(
  process.env.LOG_LEVEL ?? (process.env.DEBUG ? 'DEBUG' : 'INFO'),
).toUpperCase();
const level = names.includes(configured) ? configured : 'INFO';
if (configured !== level && configured !== '')
  process.stderr.write('{"level":"WARN","message":"unsupported LOG_LEVEL"}\n');
const rank = names.indexOf(level);
const log = (kind, message, data = {}) => {
  if (names.indexOf(kind) < rank) return;
  process.stderr.write(`${JSON.stringify({ level: kind, message, ...data })}\n`);
};
const [, , stage = 'command', ...parts] = process.argv;
const groups = parts
  .join(' ')
  .split(' ::: ')
  .map((item) => item.trim())
  .filter(Boolean);
if (groups.length === 0) process.exit(2);
for (const command of groups) {
  const [executable, ...args] = command.split(/\s+/);
  const started = Date.now();
  log('DEBUG', 'start', {
    stage,
    executable,
    args: args.map((arg) => (/token|secret|password/i.test(arg) ? '[redacted]' : arg)),
  });
  const code = await new Promise((resolve) => {
    const child = spawn(executable, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('close', (exitCode) => resolve(exitCode ?? 1));
  });
  log(code === 0 ? 'INFO' : 'ERROR', 'complete', {
    stage,
    command: executable,
    exitCode: code,
    durationMs: Date.now() - started,
  });
  if (code !== 0) process.exit(code);
}
log('INFO', 'stage-complete', { stage, commands: groups.length });
