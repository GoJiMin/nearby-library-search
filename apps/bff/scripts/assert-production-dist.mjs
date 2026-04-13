import {readdirSync} from 'node:fs';
import {dirname, extname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

function collectFiles(rootDir) {
  const filePaths = [];
  const pendingDirs = [rootDir];

  while (pendingDirs.length > 0) {
    const currentDir = pendingDirs.pop();

    if (currentDir === undefined) {
      continue;
    }

    for (const entry of readdirSync(currentDir, {withFileTypes: true})) {
      const entryPath = resolve(currentDir, entry.name);

      if (entry.isDirectory()) {
        pendingDirs.push(entryPath);
        continue;
      }

      if (entry.isFile()) {
        filePaths.push(entryPath);
      }
    }
  }

  return filePaths.sort();
}

function toDistOutputs(sourceRelativePath) {
  if (extname(sourceRelativePath) !== '.ts') {
    return [];
  }

  return [
    sourceRelativePath.replace(/\.ts$/u, '.js'),
    sourceRelativePath.replace(/\.ts$/u, '.d.ts'),
  ];
}

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const bffRootDir = resolve(scriptsDir, '..');
const srcDir = resolve(bffRootDir, 'src');
const distDir = resolve(bffRootDir, 'dist');

function normalizeRelativePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

const sourceFiles = collectFiles(srcDir)
  .map(filePath => normalizeRelativePath(relative(srcDir, filePath)))
  .filter(sourceRelativePath => !sourceRelativePath.includes('/test/'))
  .filter(sourceRelativePath => !sourceRelativePath.endsWith('.test.ts'))
  .sort();

const expectedDistFiles = new Set(sourceFiles.flatMap(toDistOutputs));
const actualDistFiles = collectFiles(distDir)
  .map(filePath => normalizeRelativePath(relative(distDir, filePath)))
  .sort();

const unexpectedDistFiles = actualDistFiles.filter(distRelativePath => !expectedDistFiles.has(distRelativePath));
const missingDistFiles = Array.from(expectedDistFiles).filter(distRelativePath => !actualDistFiles.includes(distRelativePath));

if (unexpectedDistFiles.length === 0 && missingDistFiles.length === 0) {
  process.exit(0);
}

const messages = ['Production dist assertion failed.'];

if (unexpectedDistFiles.length > 0) {
  messages.push(`Unexpected files:\n- ${unexpectedDistFiles.join('\n- ')}`);
}

if (missingDistFiles.length > 0) {
  messages.push(`Missing files:\n- ${missingDistFiles.join('\n- ')}`);
}

throw new Error(messages.join('\n\n'));
