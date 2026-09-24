# spec-id

## Purpose

The spec id is the directory that contains `spec.md`, including paths under an archived change.

## Requirements

### Requirement: The spec id is the directory that holds spec.md

The id SHALL be the parent directory of `spec.md`, including when that file sits under `openspec/changes/archive/`.

#### Scenario: An archived change path names the spec directory

- **WHEN** the path ends in `specs/<id>/spec.md`
- **THEN** the spec id is that directory name
