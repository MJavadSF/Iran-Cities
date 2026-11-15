import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const env = { ...process.env };
for (const key of Object.keys(env)) if (key.toLowerCase() === 'npm_config_dry_run') delete env[key];

const dir = mkdtempSync(join(tmpdir(), 'iran-cities-pack-'));
try {
  execFileSync(npx, ['publint', '--strict'], { stdio: 'inherit', env, shell: process.platform === 'win32' });
  execFileSync(npm, ['pack', '--pack-destination', dir, '--silent'], { stdio: ['ignore', 'ignore', 'inherit'], env, shell: process.platform === 'win32' });
  const tarball = readdirSync(dir).find((file) => file.endsWith('.tgz'));
  if (!tarball) throw new Error('npm pack did not create a tarball');
  execFileSync(npx, ['attw', join(dir, tarball), '--exclude-entrypoints', './components.css', './data/*'], {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
