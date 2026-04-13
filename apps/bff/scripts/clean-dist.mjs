import {mkdirSync, rmSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const bffRootDir = resolve(scriptsDir, '..');
const distDir = resolve(bffRootDir, 'dist');
const buildInfoFile = resolve(bffRootDir, 'tsconfig.build.tsbuildinfo');

rmSync(distDir, {force: true, recursive: true});
rmSync(buildInfoFile, {force: true});
mkdirSync(distDir, {recursive: true});
