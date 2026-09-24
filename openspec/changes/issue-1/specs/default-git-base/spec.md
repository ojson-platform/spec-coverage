## RENAMED Requirements

- FROM: `### Requirement: The git base defaults to origin/master`
- TO: `### Requirement: The package chooses the change diff base`

## MODIFIED Requirements

### Requirement: The package chooses the change diff base

The change diff SHALL use the pull-request base when that base is present. When the pull-request base is absent, the change diff SHALL use the remote default branch. The change diff SHALL compare that base to `HEAD`. When `origin/master` is not a revision, the coverage check SHALL finish and SHALL NOT exit on `fatal: bad revision 'origin/master...HEAD'`.

#### Scenario: The pull-request base is the change diff base

- **WHEN** a pull-request base is present
- **THEN** the change diff compares that base to `HEAD`

#### Scenario: The remote default branch is the base when the pull-request base is absent

- **WHEN** no pull-request base is present
- **THEN** the change diff compares the remote default branch to `HEAD`

#### Scenario: A checkout with no origin/master finishes the coverage check

- **WHEN** `origin/master` is not a revision
- **THEN** the coverage check finishes and does not exit on `fatal: bad revision 'origin/master...HEAD'`
