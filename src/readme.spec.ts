import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {expect} from 'vitest';

import {requirement, scenario, spec} from './wrap.ts';

const readme = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'README.md'),
  'utf8',
);

spec('readme-git-base', () => {
  requirement('README documents package-chosen git base', () => {
    scenario(
      'design.md Technical prerequisites: README no longer documents SPEC_COVERAGE_BASE or origin/master as the default base',
      () => {
        expect(readme).not.toMatch(/SPEC_COVERAGE_BASE/);
        expect(readme).not.toMatch(/origin\/master/);
      },
    );
  });
});
