import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

import {scenariosIn, specIdOf} from './parse.ts';
import {tripleKey, type Triple} from './triple.ts';

function specFiles(dir: string): string[] {
  const found: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry);
    const spec = path.join(abs, 'spec.md');
    try {
      readFileSync(spec, 'utf8');
      found.push(spec);
    } catch {
      found.push(...specFiles(abs));
    }
  }
  return found;
}

export function stableScenarios(root: string): Triple[] {
  return specFiles(path.join(root, 'openspec', 'specs')).flatMap(file =>
    scenariosIn(readFileSync(file, 'utf8'), specIdOf(path.relative(root, file))),
  );
}

/** Change spec files this diff adds or edits, including archive/. */
export function changedChangeSpecs(root: string, base: string): string[] {
  const out = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`, '--', 'openspec/changes'],
    {cwd: root, encoding: 'utf8'},
  );
  return out
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^openspec\/changes\/(?:.*\/)?specs\/[^/]+\/spec\.md$/.test(line));
}

export function deltaScenarios(root: string, files: readonly string[]): Triple[] {
  return files.flatMap(file => {
    let text = '';
    try {
      text = readFileSync(path.join(root, file), 'utf8');
    } catch {
      return [];
    }
    return scenariosIn(text, specIdOf(file));
  });
}

export function requiredScenarios(root: string, base: string): Triple[] {
  const byKey = new Map<string, Triple>();
  for (const triple of [
    ...stableScenarios(root),
    ...deltaScenarios(root, changedChangeSpecs(root, base)),
  ]) {
    byKey.set(tripleKey(triple), triple);
  }
  return [...byKey.values()];
}
