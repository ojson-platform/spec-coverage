# required-tree

## Purpose

The denominator is every scenario in `openspec/specs/`, folded with each open `openspec/changes/issue-<key>/` spec the branch added or edited, plus scenarios from other change specs the branch added or edited, including under `archive/`.

## Requirements

### Requirement: The branch diff adds change specs, including archive

A `spec.md` under `openspec/changes/` that the branch added or edited, other than `openspec/changes/issue-<key>/specs/<id>/spec.md`, SHALL contribute its scenarios. This includes a spec under `archive/`. A spec already on the base SHALL NOT be listed as a branch change. Scenarios already in `openspec/specs/` SHALL stay required alongside those contributed scenarios.

#### Scenario: An archived spec added on the branch is required together with the stable scenario

- **WHEN** the base has a stable scenario and the branch adds `openspec/changes/archive/.../spec.md` with another scenario
- **THEN** both scenarios are required and the change list contains that archive path

#### Scenario: A spec already on the base is not a branch change

- **WHEN** a stable spec is already on the base commit
- **THEN** the branch change list does not include that stable file

### Requirement: An open issue delta folds the denominator

A `spec.md` under `openspec/changes/issue-<key>/` that the branch added or edited SHALL fold into the required scenarios for that spec id. The files under `openspec/specs/` SHALL stay unchanged. The fold SHALL apply RENAMED, then REMOVED, then MODIFIED, then ADDED. RENAMED retitles a requirement and keeps its scenarios. REMOVED drops that requirement's scenarios. MODIFIED replaces that requirement's scenarios with the scenarios in the block. ADDED adds its scenarios, and scenarios of other requirements stay.

#### Scenario: A rename keeps the scenarios under the new name

- **WHEN** the base has requirement `The key is text` with scenario `The key is text beside the title`, and the branch adds an open issue delta that renames that requirement to `The key is a link to the issue`
- **THEN** the required scenario keeps its text under the new requirement, the old requirement is absent, and the baseline file is unchanged

#### Scenario: A modification replaces the scenarios of that requirement

- **WHEN** the base requirement `End` has scenario `End with a numeric end time`, and the branch adds an open issue delta that modifies `End` with only scenario `Fail with a numeric end time`
- **THEN** only `Fail with a numeric end time` is required for that requirement, and the baseline file is unchanged

#### Scenario: A rename followed by a modification drops the old requirement

- **WHEN** the base has requirement `The key is text` with scenario `The key is text beside the title`, and the branch adds an open issue delta that renames it to `The key is a link to the issue` and modifies that name with scenario `A named repository makes the key a link to the issue`
- **THEN** the required set contains the new requirement and scenario, the old requirement is absent, and the baseline file is unchanged

#### Scenario: A removal drops the stable scenarios

- **WHEN** the base has requirement `Caller base` with scenario `The caller names the base` and requirement `End` with scenario `End with a numeric end time`, and the branch adds an open issue delta that removes `Caller base`
- **THEN** `The caller names the base` is not required, `End with a numeric end time` stays required, and the baseline file is unchanged

#### Scenario: An addition keeps unrelated stable scenarios

- **WHEN** the base has scenario `End with a numeric end time` and the branch adds an open issue delta that adds requirement `Start` with scenario `Start stores the clock`
- **THEN** both scenarios are required and the baseline file is unchanged

### Requirement: A change spec that is not on disk adds no scenarios

A listed change path that cannot be read SHALL contribute no scenarios.

#### Scenario: A missing change file yields no scenarios

- **WHEN** the change list names a `spec.md` that is not on disk
- **THEN** that path adds no scenarios
