# scenario-selection

## Purpose

The check decides which scenario headings in a spec file are required.

## Requirements

### Requirement: Requirements, ADDED, and MODIFIED keep their scenarios

A scenario under `## Requirements`, `## ADDED Requirements`, or `## MODIFIED Requirements`, and under a `### Requirement:` heading, SHALL be required.

#### Scenario: An added scenario is kept

- **WHEN** a change spec has an ADDED requirement with a scenario
- **THEN** that scenario is required under its spec id

#### Scenario: A modified scenario is kept

- **WHEN** a change spec has a MODIFIED requirement with a scenario
- **THEN** that scenario is required under its spec id

#### Scenario: A stable Requirements scenario is kept

- **WHEN** a baseline spec has a Requirements section with a requirement and a scenario
- **THEN** that scenario is required under its spec id

### Requirement: REMOVED scenarios are not required

A scenario under `## REMOVED Requirements` SHALL NOT be required.

#### Scenario: A removed scenario is dropped

- **WHEN** a change spec lists a scenario under REMOVED Requirements
- **THEN** that scenario is not required

### Requirement: A scenario outside those sections is not required

A scenario under any other `##` heading SHALL NOT be required. A scenario that appears before a `### Requirement:` heading SHALL NOT be required.

#### Scenario: A scenario under another section is dropped

- **WHEN** a scenario sits under a `##` heading other than Requirements, ADDED Requirements, or MODIFIED Requirements
- **THEN** that scenario is not required

#### Scenario: A scenario before any requirement is dropped

- **WHEN** a scenario line appears while no requirement heading is open
- **THEN** that scenario is not required
