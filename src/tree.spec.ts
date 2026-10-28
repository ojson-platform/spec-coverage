import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
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

function repoWithOpenIssue(specName: string, stable: string, delta: string): string {
  const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-'));
  git(root, ['init', '-b', 'master']);
  const stableDir = path.join(root, 'openspec/specs', specName);
  mkdirSync(stableDir, {recursive: true});
  writeFileSync(path.join(stableDir, 'spec.md'), stable);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'base']);
  git(root, ['checkout', '-b', 'sdd/7']);
  const deltaDir = path.join(root, 'openspec/changes/issue-7/specs', specName);
  mkdirSync(deltaDir, {recursive: true});
  writeFileSync(path.join(deltaDir, 'spec.md'), delta);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'delta']);
  return root;
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

  requirement('An open issue delta folds the denominator', () => {
    scenario('A rename keeps the scenarios under the new name', () => {
      const stable =
        '## Requirements\n\n### Requirement: The key is text\n\n#### Scenario: The key is text beside the title\n';
      const delta =
        '## RENAMED Requirements\n\n- FROM: `### Requirement: The key is text`\n- TO: `### Requirement: The key is a link to the issue`\n';
      const root = repoWithOpenIssue('plaque-key', stable, delta);
      const baseline = path.join(root, 'openspec/specs/plaque-key/spec.md');
      expect(requiredScenarios(root, 'master')).toEqual([
        {
          spec: 'plaque-key',
          requirement: 'The key is a link to the issue',
          scenario: 'The key is text beside the title',
        },
      ]);
      expect(readFileSync(baseline, 'utf8')).toBe(stable);
    });

    scenario('A modification replaces the scenarios of that requirement', () => {
      const stable =
        '## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n';
      const delta =
        '## MODIFIED Requirements\n\n### Requirement: End\n\n#### Scenario: Fail with a numeric end time\n';
      const root = repoWithOpenIssue('span-end', stable, delta);
      const baseline = path.join(root, 'openspec/specs/span-end/spec.md');
      expect(requiredScenarios(root, 'master')).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
      ]);
      expect(readFileSync(baseline, 'utf8')).toBe(stable);
    });

    scenario('A rename followed by a modification drops the old requirement', () => {
      const stable =
        '## Requirements\n\n### Requirement: The key is text\n\n#### Scenario: The key is text beside the title\n';
      const delta = [
        '## RENAMED Requirements',
        '',
        '- FROM: `### Requirement: The key is text`',
        '- TO: `### Requirement: The key is a link to the issue`',
        '',
        '## MODIFIED Requirements',
        '',
        '### Requirement: The key is a link to the issue',
        '',
        '#### Scenario: A named repository makes the key a link to the issue',
        '',
      ].join('\n');
      const root = repoWithOpenIssue('plaque-key', stable, delta);
      const baseline = path.join(root, 'openspec/specs/plaque-key/spec.md');
      expect(requiredScenarios(root, 'master')).toEqual([
        {
          spec: 'plaque-key',
          requirement: 'The key is a link to the issue',
          scenario: 'A named repository makes the key a link to the issue',
        },
      ]);
      expect(readFileSync(baseline, 'utf8')).toBe(stable);
    });

    scenario('A removal drops the stable scenarios', () => {
      const stable = [
        '## Requirements',
        '',
        '### Requirement: Caller base',
        '',
        '#### Scenario: The caller names the base',
        '',
        '### Requirement: End',
        '',
        '#### Scenario: End with a numeric end time',
        '',
      ].join('\n');
      const delta = '## REMOVED Requirements\n\n### Requirement: Caller base\n';
      const root = repoWithOpenIssue('span-end', stable, delta);
      const baseline = path.join(root, 'openspec/specs/span-end/spec.md');
      expect(requiredScenarios(root, 'master')).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
      ]);
      expect(readFileSync(baseline, 'utf8')).toBe(stable);
    });

    scenario('An addition keeps unrelated stable scenarios', () => {
      const stable =
        '## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n';
      const delta =
        '## ADDED Requirements\n\n### Requirement: Start\n\n#### Scenario: Start stores the clock\n';
      const root = repoWithOpenIssue('span-end', stable, delta);
      const baseline = path.join(root, 'openspec/specs/span-end/spec.md');
      expect(requiredScenarios(root, 'master')).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
        {spec: 'span-end', requirement: 'Start', scenario: 'Start stores the clock'},
      ]);
      expect(readFileSync(baseline, 'utf8')).toBe(stable);
    });
  });

  requirement('A change spec that is not on disk adds no scenarios', () => {
    scenario('A missing change file yields no scenarios', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-'));
      expect(deltaScenarios(root, ['openspec/changes/issue-1/specs/span-end/spec.md'])).toEqual([]);
    });
  });
});
