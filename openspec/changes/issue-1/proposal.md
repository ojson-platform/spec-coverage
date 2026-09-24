# CI-safe default base ref for git diff

## Problem

After vitest passes, `@ojson/spec-coverage` runs `git diff origin/master...HEAD`. In GitHub Actions the checkout often has no `origin/master` remote ref, so the reporter fails with `fatal: bad revision 'origin/master...HEAD'`.

This breaks **Build and test examples**, **Test on Node.js 22.x**, and **Test on Node.js 20.x** on PR ojson-platform/models#19 (issue ojson-platform/models#18).

## Outcome

When `SPEC_COVERAGE_BASE` is unset, the change diff uses a base revision the checkout can resolve. A CI checkout with no `origin/master` finishes the coverage check instead of dying on a bad revision.

## Scope

The default git base for the change diff in this package: the rule a caller hits when `SPEC_COVERAGE_BASE` is unset.

## Out of scope

- A set `SPEC_COVERAGE_BASE`: the caller already names the base
- Which paths the diff lists, and which scenarios those paths require
- The models vitest config and pull request ojson-platform/models#19
- CI workflow changes in other repositories

## Constraints

- An explicit `SPEC_COVERAGE_BASE` stays the base the caller set
- The check still compares that base to `HEAD` for change specs
- The reporter must not exit on `fatal: bad revision 'origin/master...HEAD'` when that ref is absent and the variable is unset

## Capabilities

### Added

### Modified

- default-git-base When `SPEC_COVERAGE_BASE` is unset, the change diff uses a base revision the checkout can resolve, including a checkout with no `origin/master`.

## Open questions

- [ ] When `origin/master` exists, does an unset `SPEC_COVERAGE_BASE` stay `origin/master`?
- [ ] When `origin/master` is absent, which revision is the default: the pull-request base, the remote default branch, or another ref already in the checkout?
