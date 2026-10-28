import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

import {scenariosIn, specIdOf} from './parse.ts';
import {tripleKey, type Triple} from './triple.ts';

export function gitRevisionExists(root: string, ref: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], {cwd: root, stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

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
  if (!gitRevisionExists(root, base)) {
    return [];
  }
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

const OPEN_ISSUE_SPEC = /^openspec\/changes\/issue-[^/]+\/specs\/[^/]+\/spec\.md$/;

function sectionBody(markdown: string, heading: string): string[] | undefined {
  const lines = markdown.split('\n');
  const start = lines.findIndex(line => line === heading);
  if (start < 0) {
    return undefined;
  }
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) {
      break;
    }
    body.push(line);
  }
  return body;
}

function renamesIn(markdown: string): Array<[string, string]> {
  const body = sectionBody(markdown, '## RENAMED Requirements');
  if (!body) {
    return [];
  }
  const pairs: Array<[string, string]> = [];
  let from: string | undefined;
  for (const line of body) {
    const fromMatch = line.match(/^-\s+FROM:\s+`### Requirement: ([^`]+)`\s*$/);
    if (fromMatch) {
      from = fromMatch[1];
      continue;
    }
    const toMatch = line.match(/^-\s+TO:\s+`### Requirement: ([^`]+)`\s*$/);
    if (toMatch && from !== undefined) {
      pairs.push([from, toMatch[1]]);
      from = undefined;
    }
  }
  return pairs;
}

function removedNames(markdown: string): string[] {
  const body = sectionBody(markdown, '## REMOVED Requirements');
  if (!body) {
    return [];
  }
  const names: string[] = [];
  for (const line of body) {
    const heading = line.match(/^### Requirement: (.+)$/);
    if (heading) {
      names.push(heading[1].trim());
    }
  }
  return names;
}

function scenariosUnder(markdown: string, heading: string, spec: string): Triple[] {
  const body = sectionBody(markdown, heading);
  if (!body) {
    return [];
  }
  return scenariosIn([heading, ...body].join('\n'), spec);
}

function foldOpenIssue(triples: readonly Triple[], markdown: string, spec: string): Triple[] {
  let next = triples.map(triple => ({...triple}));
  for (const [from, to] of renamesIn(markdown)) {
    next = next.map(triple =>
      triple.spec === spec && triple.requirement === from ? {...triple, requirement: to} : triple,
    );
  }
  const removed = new Set(removedNames(markdown));
  if (removed.size > 0) {
    next = next.filter(triple => !(triple.spec === spec && removed.has(triple.requirement)));
  }
  const modified = scenariosUnder(markdown, '## MODIFIED Requirements', spec);
  const replaced = new Set(modified.map(triple => triple.requirement));
  if (replaced.size > 0) {
    next = next.filter(triple => !(triple.spec === spec && replaced.has(triple.requirement)));
    next.push(...modified);
  }
  next.push(...scenariosUnder(markdown, '## ADDED Requirements', spec));
  return next;
}

export function requiredScenarios(root: string, base?: string): Triple[] {
  const changed = base === undefined ? [] : changedChangeSpecs(root, base);
  const open = changed.filter(file => OPEN_ISSUE_SPEC.test(file));
  const rest = changed.filter(file => !OPEN_ISSUE_SPEC.test(file));
  let triples = stableScenarios(root);
  for (const file of open) {
    let text = '';
    try {
      text = readFileSync(path.join(root, file), 'utf8');
    } catch {
      continue;
    }
    triples = foldOpenIssue(triples, text, specIdOf(file));
  }
  const byKey = new Map<string, Triple>();
  for (const triple of [...triples, ...deltaScenarios(root, rest)]) {
    byKey.set(tripleKey(triple), triple);
  }
  return [...byKey.values()];
}
