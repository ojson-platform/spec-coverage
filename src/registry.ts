import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';

import {tripleKey, type Triple} from './triple.ts';

export function registryDir(root = process.cwd()): string {
  return process.env.SPEC_COVERAGE_DIR ?? path.join(root, '.spec-coverage');
}

export function recordTriple(triple: Triple, dir = registryDir()): void {
  mkdirSync(dir, {recursive: true});
  const name = `${process.pid}-${randomBytes(6).toString('hex')}.json`;
  writeFileSync(path.join(dir, name), JSON.stringify(triple));
}

export function readRegistry(dir = registryDir()): Triple[] {
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const seen = new Set<string>();
  const triples: Triple[] = [];
  for (const name of names) {
    if (!name.endsWith('.json')) {
      continue;
    }
    const triple = JSON.parse(readFileSync(path.join(dir, name), 'utf8')) as Triple;
    const key = tripleKey(triple);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    triples.push(triple);
  }
  return triples;
}
