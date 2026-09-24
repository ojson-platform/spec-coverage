# Design

## Verification boundary

A test stands at the coverage check. It sees the base the change diff compares to `HEAD`, and whether the check finishes. It does not pass a base in, and it does not treat `SPEC_COVERAGE_BASE` as a control.

- `default-git-base`. When a pull-request base revision is present, the change diff compares that base to `HEAD`. When no pull-request base is present, the change diff compares the remote default branch to `HEAD`. When `origin/master` is not a revision, the coverage check finishes and does not exit on `fatal: bad revision 'origin/master...HEAD'`.
- `caller-git-base`. A set `SPEC_COVERAGE_BASE` is not the base, whether or not `origin/master` is a revision. The check does not read that variable.

## External contracts

none

## Technical prerequisites

- Code in this PR. The package chooses the base and does not read `SPEC_COVERAGE_BASE`. The pull-request base is present when `GITHUB_BASE_REF` names a revision already in the checkout (`origin/<name>`, otherwise `<name>`). Otherwise the base is the revision `refs/remotes/origin/HEAD` already records. The change diff compares that revision to `HEAD`. The package does not fetch. When that revision is absent, the diff is not run against a missing revision, so the check finishes and does not exit on `fatal: bad revision 'origin/master...HEAD'`. No flag: this choice is the behavior after merge.
- Code in this PR. The README no longer tells a caller to set `SPEC_COVERAGE_BASE` or that the default is `origin/master`.

## Open decisions

none
