# coverage-result

## Purpose

The check compares required triples with registered triples.

## Requirements

### Requirement: A missing required triple fails the check

A required triple with no registration SHALL be reported as missing and SHALL fail the check.

#### Scenario: The missing triple is listed and the check fails

- **WHEN** a required triple is not registered
- **THEN** the report lists it as missing and the check fails

### Requirement: A registration for another spec fails the check

A registered triple whose spec id is not among the required triples SHALL be reported as outside and SHALL fail the check.

#### Scenario: A triple whose spec id is not required is outside and fails

- **WHEN** a registration names a spec id that no required triple uses
- **THEN** the report lists it as outside and the check fails

### Requirement: A near miss does not fail when every required triple is present

A registered triple for a required spec id that does not match a required triple SHALL be reported as near. That near line alone SHALL NOT fail the check.

#### Scenario: A different triple for a required spec is near and the check passes

- **WHEN** every required triple is registered and one extra triple uses a required spec id
- **THEN** the report lists the extra triple as near and the check passes

### Requirement: A complete registration passes

When every required triple is registered and no outside triple is registered, the check SHALL pass.

#### Scenario: Every required triple registered passes

- **WHEN** the registered triples are exactly the required triples
- **THEN** the check passes
