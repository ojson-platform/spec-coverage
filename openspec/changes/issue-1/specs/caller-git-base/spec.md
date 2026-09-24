## MODIFIED Requirements

### Requirement: SPEC_COVERAGE_BASE does not select the base

The check SHALL NOT read `SPEC_COVERAGE_BASE`. A set `SPEC_COVERAGE_BASE` SHALL NOT select the base, whether or not `origin/master` is a revision.

#### Scenario: A set SPEC_COVERAGE_BASE is ignored

- **WHEN** `SPEC_COVERAGE_BASE` is set
- **THEN** the base is not that value

#### Scenario: A set SPEC_COVERAGE_BASE is ignored when origin/master is absent

- **WHEN** `SPEC_COVERAGE_BASE` is set and `origin/master` is not a revision
- **THEN** the base is not that value
