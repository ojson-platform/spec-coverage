# default-git-base

## Purpose

The change diff base when the caller does not name one.

## Requirements

### Requirement: The git base defaults to origin/master

When `SPEC_COVERAGE_BASE` is unset, the change diff SHALL use `origin/master`. When that revision is absent, the diff SHALL fail.

#### Scenario: An unset SPEC_COVERAGE_BASE is origin/master

- **WHEN** `SPEC_COVERAGE_BASE` is unset
- **THEN** the base is `origin/master`

#### Scenario: A checkout with no origin/master fails the change diff

- **WHEN** `SPEC_COVERAGE_BASE` is unset and `origin/master` is not a revision
- **THEN** the change diff fails with `fatal: bad revision 'origin/master...HEAD'`
