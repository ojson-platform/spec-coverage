import {expect} from 'vitest';

import {scenariosIn, specIdOf} from './parse.ts';
import {requirement, scenario, spec} from './wrap.ts';

const delta = `
## ADDED Requirements

### Requirement: Keep the value

#### Scenario: First read stores it

## MODIFIED Requirements

### Requirement: Refresh

#### Scenario: Hit returns the stored value

## REMOVED Requirements

### Requirement: Old

#### Scenario: Gone

## Purpose

#### Scenario: Not a requirement yet
`;

spec('scenario-selection', () => {
  requirement('Requirements, ADDED, and MODIFIED keep their scenarios', () => {
    scenario('An added scenario is kept', () => {
      expect(scenariosIn(delta, 'cache-first')).toContainEqual({
        spec: 'cache-first',
        requirement: 'Keep the value',
        scenario: 'First read stores it',
      });
    });

    scenario('A modified scenario is kept', () => {
      expect(scenariosIn(delta, 'cache-first')).toContainEqual({
        spec: 'cache-first',
        requirement: 'Refresh',
        scenario: 'Hit returns the stored value',
      });
    });

    scenario('A stable Requirements scenario is kept', () => {
      const text = `## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n`;
      expect(scenariosIn(text, 'span-end')).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
      ]);
    });
  });

  requirement('REMOVED scenarios are not required', () => {
    scenario('A removed scenario is dropped', () => {
      expect(scenariosIn(delta, 'cache-first').some(triple => triple.scenario === 'Gone')).toBe(false);
    });
  });

  requirement('A scenario outside those sections is not required', () => {
    scenario('A scenario under another section is dropped', () => {
      const text = `## Purpose\n\n### Requirement: End\n\n#### Scenario: Noted aside\n`;
      expect(scenariosIn(text, 'span-end')).toEqual([]);
    });

    scenario('A scenario before any requirement is dropped', () => {
      expect(scenariosIn(delta, 'cache-first').some(triple => triple.scenario === 'Not a requirement yet')).toBe(
        false,
      );
    });
  });
});

spec('spec-id', () => {
  requirement('The spec id is the directory that holds spec.md', () => {
    scenario('An archived change path names the spec directory', () => {
      expect(specIdOf('openspec/changes/archive/issue-13/specs/span-end/spec.md')).toBe('span-end');
    });
  });
});
