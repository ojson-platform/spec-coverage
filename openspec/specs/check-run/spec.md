# check-run

## Purpose

The check reads the registry and the tree after tests, and the setup clears the registry first.

## Requirements

### Requirement: Gaps fail the check

When the report has a missing or outside triple, the check SHALL throw.

#### Scenario: Gaps throw spec coverage has gaps

- **WHEN** the tree requires a scenario that the registry does not contain
- **THEN** the check throws an error whose message is `spec coverage has gaps`

### Requirement: The registry is cleared before the run

The setup SHALL remove the registry directory before tests record triples.

#### Scenario: setup removes the registry directory

- **WHEN** the registry directory holds a recorded triple and setup runs
- **THEN** that directory is gone
