# @ojson/spec-coverage

OpenSpec scenario coverage for a service test run.

A scenario counts when a test calls `scenario` inside `requirement` inside `spec`. The call writes a triple to `.spec-coverage/`. `scenario.skip` does not. The check reads that directory after vitest, plus every scenario in `openspec/specs/`, plus scenarios in `openspec/changes/**/specs` files the branch added or changed against the base, including `archive/`. Sections named `REMOVED Requirements` are not required.

The key is the spec directory name, the Requirement heading, and the Scenario heading.

```ts
import {spec, requirement, scenario} from '@ojson/spec-coverage';

spec('span-end', () => {
  requirement('Span ends when the context ends or fails', () => {
    scenario('End with a numeric end time', () => {
      // exercise the scenario
    });
  });
});
```

Point vitest at the setup and the reporter. The setup clears `.spec-coverage/` before the run. The reporter prints gaps after the tests and fails the run when a required scenario has no registration, or a registration names a spec that is not in the tree. A registration for a known spec with a different triple is printed and does not fail the run by itself. A failing test still counts as coverage; the test failure fails the job on its own.

```js
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['@ojson/spec-coverage/setup'],
    reporters: ['default', '@ojson/spec-coverage/reporter'],
  },
});
```

The package chooses the git base for the change diff: the pull-request base when present, otherwise the remote default branch for the checkout. `SPEC_COVERAGE_DIR` overrides the registry directory.

The command `spec-coverage` runs the same check without vitest.
