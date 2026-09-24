import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const readme = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'README.md'),
  'utf8',
);

describe('readme-git-base', () => {
  it('design.md Technical prerequisites: README no longer documents SPEC_COVERAGE_BASE or origin/master as the default base', () => {
    expect(readme).not.toMatch(/SPEC_COVERAGE_BASE/);
    expect(readme).not.toMatch(/origin\/master/);
  });
});
