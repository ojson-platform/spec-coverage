# registration

## Purpose

A test registers a scenario by calling `scenario` inside `requirement` inside `spec`.

## Requirements

### Requirement: scenario() records the surrounding triple

`scenario()` inside `spec()` and `requirement()` SHALL record the spec id, the requirement title, and the scenario title.

#### Scenario: The recorded triple is the spec id, the requirement title, and the scenario title

- **WHEN** a test calls `scenario` inside `requirement` inside `spec`
- **THEN** the registry contains that spec id, requirement title, and scenario title

### Requirement: scenario() outside a frame throws

`scenario()` outside `spec()` SHALL throw. `scenario()` inside `spec()` and outside `requirement()` SHALL throw. Neither call records a triple.

#### Scenario: scenario() outside spec() throws

- **WHEN** `scenario()` is called with no surrounding `spec()`
- **THEN** it throws and the registry gains no triple from that call

#### Scenario: scenario() inside spec() but outside requirement() throws

- **WHEN** `scenario()` is called inside `spec()` and outside `requirement()`
- **THEN** it throws and the registry gains no triple from that call

### Requirement: scenario.skip does not record

`scenario.skip` SHALL NOT record a triple.

#### Scenario: A skipped scenario leaves the registry unchanged

- **WHEN** a test calls `scenario.skip`
- **THEN** the registry has no triple for that skipped title

### Requirement: The same triple is one registration

Two records of one spec id, requirement title, and scenario title SHALL read back as one triple.

#### Scenario: Two writes of one triple read back as one

- **WHEN** the same triple is written twice
- **THEN** reading the registry returns that triple once
