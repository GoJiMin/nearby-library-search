import {readdirSync, rmSync} from 'node:fs';
import {dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const contractsRootDir = resolve(scriptsDir, '..');
const distDir = resolve(contractsRootDir, 'dist');
const buildInfoFile = resolve(contractsRootDir, 'tsconfig.tsbuildinfo');
const srcDir = resolve(contractsRootDir, 'src');

rmSync(distDir, {force: true, recursive: true});
rmSync(buildInfoFile, {force: true});

for (const entry of readdirSync(srcDir, {withFileTypes: true})) {
  if (!entry.isFile()) {
    continue;
  }

  const entryPath = resolve(srcDir, entry.name);
  const extension = extname(entry.name);

  if (extension === '.js' || entry.name.endsWith('.d.ts')) {
    rmSync(entryPath, {force: true});
  }
}
