# caller-git-base

## Purpose

A caller-supplied name for the change diff base, used when the caller sets one.

## Requirements

### Requirement: SPEC_COVERAGE_BASE selects the base

When `SPEC_COVERAGE_BASE` is set, the change diff SHALL use that value.

#### Scenario: A set SPEC_COVERAGE_BASE is the base

- **WHEN** `SPEC_COVERAGE_BASE` is set
- **THEN** the base is that value
