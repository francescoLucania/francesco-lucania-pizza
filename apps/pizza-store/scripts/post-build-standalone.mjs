import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function findAppsPizzaStoreServerJs(rootDir) {
  const stack = [rootDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        stack.push(p);
      } else if (e.name === 'server.js') {
        const parts = p.split(/[/\\]/);
        const n = parts.length;
        if (
          n >= 3 &&
          parts[n - 1] === 'server.js' &&
          parts[n - 2] === 'pizza-store' &&
          parts[n - 3] === 'apps'
        ) {
          return p;
        }
      }
    }
  }
  return null;
}

try {
  execSync('npx next build', { cwd: appDir, stdio: 'inherit', env: process.env });
} catch {
  process.exit(1);
}

const standaloneRoot = join(appDir, '.next', 'standalone');
if (!existsSync(standaloneRoot)) {
  console.error('pizza-store: .next/standalone missing — next build failed or did not emit standalone.');
  process.exit(1);
}

const serverJs = findAppsPizzaStoreServerJs(standaloneRoot);
if (!serverJs) {
  console.error(
    'pizza-store: no apps/pizza-store/server.js under .next/standalone (list dir for debug):',
  );
  console.error(standaloneRoot);
  process.exit(1);
}

const standaloneAppDir = dirname(serverJs);
const staticSrc = join(appDir, '.next', 'static');
const staticDest = join(standaloneAppDir, '.next', 'static');
const publicSrc = join(appDir, 'public');
const publicDest = join(standaloneAppDir, 'public');

if (!existsSync(staticSrc)) {
  console.error('pizza-store: .next/static missing after build');
  process.exit(1);
}

rmSync(staticDest, { recursive: true, force: true });
rmSync(publicDest, { recursive: true, force: true });
mkdirSync(join(standaloneAppDir, '.next'), { recursive: true });
cpSync(staticSrc, staticDest, { recursive: true });
cpSync(publicSrc, publicDest, { recursive: true });

console.log('pizza-store: standalone assets copied →', standaloneAppDir);
