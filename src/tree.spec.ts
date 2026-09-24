import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {expect} from 'vitest';

import {deltaScenarios, changedChangeSpecs, requiredScenarios} from './tree.ts';
import {requirement, scenario, spec} from './wrap.ts';

function git(root: string, args: string[]): void {
  execFileSync('git', ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec', ...args], {
    cwd: root,
    stdio: 'ignore',
  });
}

function repoWithArchive(): string {
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
  return root;
}

spec('required-tree', () => {
  requirement('The branch diff adds change specs, including archive', () => {
    scenario('An archived spec added on the branch is required together with the stable scenario', () => {
      const root = repoWithArchive();
      expect(changedChangeSpecs(root, 'master')).toEqual([
        'openspec/changes/archive/issue-13/specs/span-end/spec.md',
      ]);
      expect(requiredScenarios(root, 'master')).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
        {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
      ]);
    });

    scenario('A spec already on the base is not a branch change', () => {
      const root = repoWithArchive();
      expect(changedChangeSpecs(root, 'master')).not.toContain('openspec/specs/span-end/spec.md');
    });
  });

  requirement('A change spec that is not on disk adds no scenarios', () => {
    scenario('A missing change file yields no scenarios', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-'));
      expect(deltaScenarios(root, ['openspec/changes/issue-1/specs/span-end/spec.md'])).toEqual([]);
    });
  });
});
