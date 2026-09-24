import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {expect} from 'vitest';

import {readRegistry, recordTriple, registryDir} from './registry.ts';
import {coverageBase, runCheck} from './run.ts';
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

  requirement('The git base defaults to origin/master', () => {
    scenario('An unset SPEC_COVERAGE_BASE is origin/master', () => {
      const previous = process.env.SPEC_COVERAGE_BASE;
      delete process.env.SPEC_COVERAGE_BASE;
      try {
        expect(coverageBase()).toBe('origin/master');
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
