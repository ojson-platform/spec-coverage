# CI-safe default base ref for git diff

## Problem

After vitest passes, `@ojson/spec-coverage` runs `git diff origin/master...HEAD`. In GitHub Actions the checkout often has no `origin/master` remote ref, so the reporter fails with `fatal: bad revision 'origin/master...HEAD'`.

This breaks **Build and test examples**, **Test on Node.js 22.x**, and **Test on Node.js 20.x** on PR ojson-platform/models#19 (issue ojson-platform/models#18).

The package also lets a caller name that base with `SPEC_COVERAGE_BASE`. The base belongs inside the package: a checkout should finish the check without a caller-supplied ref.

## Outcome

The change diff uses a base the package chooses. The pull-request base is first. When that base is absent, the base is the remote default branch. There is no `SPEC_COVERAGE_BASE`. A CI checkout with no `origin/master` finishes the coverage check instead of dying on a bad revision.

## Scope

The git base for the change diff in this package. The package chooses it: the pull-request base, then the remote default branch. `SPEC_COVERAGE_BASE` is not a caller control, whether or not `origin/master` is present.

## Out of scope

- Which paths the diff lists, and which scenarios those paths require
- The models vitest config and pull request ojson-platform/models#19
- CI workflow changes in other repositories

## Constraints

- Callers do not name the base; the check does not read `SPEC_COVERAGE_BASE`
- The check still compares that base to `HEAD` for change specs
- The reporter must not exit on `fatal: bad revision 'origin/master...HEAD'` when that ref is absent

## Capabilities

### Added

### Modified

- default-git-base The change diff uses the pull-request base, then the remote default branch, including a checkout with no `origin/master`.
- caller-git-base A set `SPEC_COVERAGE_BASE` no longer selects the base.

## Open questions

None.
