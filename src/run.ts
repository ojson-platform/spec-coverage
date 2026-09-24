import {readFileSync} from 'node:fs';
import path from 'node:path';

import {readRegistry, registryDir} from './registry.ts';
import {formatReport, compare, failed} from './report.ts';
import {gitRevisionExists, requiredScenarios} from './tree.ts';

export function coverageBase(): string {
  return process.env.SPEC_COVERAGE_BASE ?? 'origin/master';
}

function pullRequestDiffBase(root: string): string | undefined {
  const name = process.env.GITHUB_BASE_REF?.trim();
  if (!name) {
    return undefined;
  }
  const originRef = `origin/${name}`;
  if (gitRevisionExists(root, originRef)) {
    return originRef;
  }
  if (gitRevisionExists(root, name)) {
    return name;
  }
  return undefined;
}

function remoteDefaultDiffBase(root: string): string | undefined {
  const headFile = path.join(root, '.git', 'refs', 'remotes', 'origin', 'HEAD');
  try {
    const head = readFileSync(headFile, 'utf8').trim();
    const match = head.match(/^ref:\s+refs\/remotes\/origin\/(.+)$/);
    if (match) {
      const ref = `origin/${match[1]}`;
      if (gitRevisionExists(root, ref)) {
        return ref;
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function changeDiffBase(root: string): string | undefined {
  return pullRequestDiffBase(root) ?? remoteDefaultDiffBase(root);
}

export function runCheck(root = process.cwd(), base?: string): string {
  const resolved = base ?? changeDiffBase(root);
  const report = compare(requiredScenarios(root, resolved), readRegistry(registryDir(root)));
  const text = formatReport(report);
  if (text) {
    console.log(text);
  }
  if (failed(report)) {
    throw new Error('spec coverage has gaps');
  }
  return text;
}
