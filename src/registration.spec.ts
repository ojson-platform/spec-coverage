import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {expect} from 'vitest';

import {readRegistry, recordTriple, registryDir} from './registry.ts';
import {changeDiffBase, coverageBase, runCheck} from './run.ts';
import {changedChangeSpecs} from './tree.ts';
import {resetRegistry} from './setup.ts';
import {requirement, scenario, spec} from './wrap.ts';

let outsideSpec: Error | undefined;
try {
  scenario('loose', () => {});
} catch (caught) {
  outsideSpec = caught as Error;
}

spec('registration', () => {
  let outsideRequirement: Error | undefined;
  try {
    scenario('loose', () => {});
  } catch (caught) {
    outsideRequirement = caught as Error;
  }

  requirement('scenario() records the surrounding triple', () => {
    scenario('The recorded triple is the spec id, the requirement title, and the scenario title', () => {
      expect(readRegistry()).toContainEqual({
        spec: 'registration',
        requirement: 'scenario() records the surrounding triple',
        scenario: 'The recorded triple is the spec id, the requirement title, and the scenario title',
      });
    });
  });

  requirement('scenario() outside a frame throws', () => {
    scenario('scenario() outside spec() throws', () => {
      expect(outsideSpec?.message).toBe('scenario() must be called inside spec()');
      expect(readRegistry().some(triple => triple.scenario === 'loose')).toBe(false);
    });

    scenario('scenario() inside spec() but outside requirement() throws', () => {
      expect(outsideRequirement?.message).toBe('scenario() must be called inside requirement()');
    });
  });

  requirement('scenario.skip does not record', () => {
    scenario.skip('not this title', () => {});

    scenario('A skipped scenario leaves the registry unchanged', () => {
      expect(readRegistry().some(triple => triple.scenario === 'not this title')).toBe(false);
    });
  });

  requirement('The same triple is one registration', () => {
    scenario('Two writes of one triple read back as one', () => {
      const triple = {
        spec: 'registration',
        requirement: 'The same triple is one registration',
        scenario: 'Two writes of one triple read back as one',
      };
      recordTriple(triple);
      recordTriple(triple);
      expect(readRegistry().filter(item => item.scenario === triple.scenario)).toHaveLength(1);
    });
  });
});

spec('check-run', () => {
  requirement('Gaps fail the check', () => {
    scenario('Gaps throw spec coverage has gaps', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-check-'));
      execFileSync('git', ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec', 'init', '-b', 'master'], {
        cwd: root,
        stdio: 'ignore',
      });
      const stable = path.join(root, 'openspec/specs/span-end');
      mkdirSync(stable, {recursive: true});
      writeFileSync(
        path.join(stable, 'spec.md'),
        '## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n',
      );
      execFileSync('git', ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec', 'add', '.'], {
        cwd: root,
        stdio: 'ignore',
      });
      execFileSync('git', ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec', 'commit', '-m', 'base'], {
        cwd: root,
        stdio: 'ignore',
      });
      expect(() => runCheck(root, 'master')).toThrow('spec coverage has gaps');
    });
  });

  requirement('The registry is cleared before the run', () => {
    scenario('setup removes the registry directory', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-reset-'));
      const previous = process.env.SPEC_COVERAGE_DIR;
      delete process.env.SPEC_COVERAGE_DIR;
      try {
        recordTriple({spec: 'check-run', requirement: 'x', scenario: 'y'}, registryDir(root));
        expect(existsSync(registryDir(root))).toBe(true);
        resetRegistry(root);
        expect(existsSync(registryDir(root))).toBe(false);
      } finally {
        if (previous === undefined) {
          delete process.env.SPEC_COVERAGE_DIR;
        } else {
          process.env.SPEC_COVERAGE_DIR = previous;
        }
      }
    });
  });

});

spec('default-git-base', () => {
  const gitEnv = ['-c', 'user.email=spec@example.com', '-c', 'user.name=spec'] as const;

  function initRepoWithOriginMain(root: string): void {
    execFileSync('git', [...gitEnv, 'init', '-b', 'main'], {cwd: root, stdio: 'ignore'});
    writeFileSync(path.join(root, 'base.txt'), 'base');
    execFileSync('git', [...gitEnv, 'add', '.'], {cwd: root, stdio: 'ignore'});
    execFileSync('git', [...gitEnv, 'commit', '-m', 'base'], {cwd: root, stdio: 'ignore'});
    const mainSha = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
    writeFileSync(path.join(root, 'head.txt'), 'head');
    execFileSync('git', [...gitEnv, 'add', '.'], {cwd: root, stdio: 'ignore'});
    execFileSync('git', [...gitEnv, 'commit', '-m', 'head'], {cwd: root, stdio: 'ignore'});
    const originMain = path.join(root, '.git', 'refs', 'remotes', 'origin');
    mkdirSync(originMain, {recursive: true});
    writeFileSync(path.join(originMain, 'main'), `${mainSha}\n`);
    writeFileSync(path.join(originMain, 'HEAD'), 'ref: refs/remotes/origin/main\n');
  }

  requirement('The package chooses the change diff base', () => {
    scenario('The pull-request base is the change diff base', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-pr-base-'));
      initRepoWithOriginMain(root);
      const changeDir = path.join(root, 'openspec', 'changes', 'x', 'specs', 's');
      mkdirSync(changeDir, {recursive: true});
      writeFileSync(path.join(changeDir, 'spec.md'), '## Requirements\n\n### Requirement: R\n\n#### Scenario: S\n');
      execFileSync('git', [...gitEnv, 'add', '.'], {cwd: root, stdio: 'ignore'});
      execFileSync('git', [...gitEnv, 'commit', '-m', 'delta'], {cwd: root, stdio: 'ignore'});
      const previousBaseRef = process.env.GITHUB_BASE_REF;
      process.env.GITHUB_BASE_REF = 'main';
      try {
        const base = changeDiffBase(root);
        expect(base).toBe('origin/main');
        expect(changedChangeSpecs(root, base!)).toContain('openspec/changes/x/specs/s/spec.md');
      } finally {
        if (previousBaseRef === undefined) {
          delete process.env.GITHUB_BASE_REF;
        } else {
          process.env.GITHUB_BASE_REF = previousBaseRef;
        }
      }
    });

    scenario('The remote default branch is the base when the pull-request base is absent', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-remote-default-'));
      initRepoWithOriginMain(root);
      const previousBaseRef = process.env.GITHUB_BASE_REF;
      delete process.env.GITHUB_BASE_REF;
      try {
        const base = changeDiffBase(root);
        expect(base).toBe('origin/main');
        expect(() => changedChangeSpecs(root, base!)).not.toThrow();
      } finally {
        if (previousBaseRef === undefined) {
          delete process.env.GITHUB_BASE_REF;
        } else {
          process.env.GITHUB_BASE_REF = previousBaseRef;
        }
      }
    });

    scenario('A checkout with no origin/master finishes the coverage check', () => {
      const root = mkdtempSync(path.join(tmpdir(), 'spec-coverage-no-origin-'));
      execFileSync('git', [...gitEnv, 'init', '-b', 'master'], {cwd: root, stdio: 'ignore'});
      writeFileSync(path.join(root, 'only.txt'), 'only');
      execFileSync('git', [...gitEnv, 'add', '.'], {cwd: root, stdio: 'ignore'});
      execFileSync('git', [...gitEnv, 'commit', '-m', 'only'], {cwd: root, stdio: 'ignore'});
      const previousBaseRef = process.env.GITHUB_BASE_REF;
      delete process.env.GITHUB_BASE_REF;
      try {
        expect(changeDiffBase(root)).toBeUndefined();
        expect(() => runCheck(root)).not.toThrow(/fatal: bad revision/);
      } finally {
        if (previousBaseRef === undefined) {
          delete process.env.GITHUB_BASE_REF;
        } else {
          process.env.GITHUB_BASE_REF = previousBaseRef;
        }
      }
    });
  });
});

spec('caller-git-base', () => {
  requirement('SPEC_COVERAGE_BASE selects the base', () => {
    scenario('A set SPEC_COVERAGE_BASE is the base', () => {
      const previous = process.env.SPEC_COVERAGE_BASE;
      process.env.SPEC_COVERAGE_BASE = 'origin/main';
      try {
        expect(coverageBase()).toBe('origin/main');
      } finally {
        if (previous === undefined) {
          delete process.env.SPEC_COVERAGE_BASE;
        } else {
          process.env.SPEC_COVERAGE_BASE = previous;
        }
      }
    });
  });
});
