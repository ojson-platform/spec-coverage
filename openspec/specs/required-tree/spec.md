# required-tree

## Purpose

The denominator is every scenario in `openspec/specs/` plus scenarios from change specs the branch added or edited.

## Requirements

### Requirement: The branch diff adds change specs, including archive

A `spec.md` under `openspec/changes/` that the branch added or edited, including under `archive/`, SHALL contribute its scenarios. A spec already on the base SHALL NOT be listed as a branch change. Scenarios already in `openspec/specs/` SHALL stay required.

#### Scenario: An archived spec added on the branch is required together with the stable scenario

- **WHEN** the base has a stable scenario and the branch adds `openspec/changes/archive/.../spec.md` with another scenario
- **THEN** both scenarios are required and the change list contains that archive path

#### Scenario: A spec already on the base is not a branch change

- **WHEN** a stable spec is already on the base commit
- **THEN** the branch change list does not include that stable file

### Requirement: A change spec that is not on disk adds no scenarios

A listed change path that cannot be read SHALL contribute no scenarios.

#### Scenario: A missing change file yields no scenarios

- **WHEN** the change list names a `spec.md` that is not on disk
- **THEN** that path adds no scenarios
