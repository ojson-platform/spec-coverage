import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {changedChangeSpecs, requiredScenarios} from './tree.ts';

function git(root: string, args: string[]): void {
  execFileSync('git', ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec', ...args], {
    cwd: root,
    stdio: 'ignore',
  });
}

describe('changedChangeSpecs', () => {
  it('includes an archived change spec the branch added and skips specs already on the base', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-'));
    git(root, ['init', '-b', 'master']);
    const stable = path.join(root, 'openspec/specs/span-end');
    mkdirSync(stable, {recursive: true});
    writeFileSync(
      path.join(stable, 'spec.md'),
      '## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n',
    );
    git(root, ['add', '.']);
    git(root, ['commit', '-m', 'base']);
    git(root, ['checkout', '-b', 'sdd/13']);
    const archived = path.join(root, 'openspec/changes/archive/issue-13/specs/span-end');
    mkdirSync(archived, {recursive: true});
    writeFileSync(
      path.join(archived, 'spec.md'),
      '## MODIFIED Requirements\n\n### Requirement: End\n\n#### Scenario: Fail with a numeric end time\n',
    );
    git(root, ['add', '.']);
    git(root, ['commit', '-m', 'archive']);
    expect(changedChangeSpecs(root, 'master')).toEqual([
      'openspec/changes/archive/issue-13/specs/span-end/spec.md',
    ]);
    expect(requiredScenarios(root, 'master')).toEqual([
      {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
      {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
    ]);
  });
});
