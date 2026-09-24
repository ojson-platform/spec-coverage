import {describe, expect, it} from 'vitest';

import {scenariosIn, specIdOf} from './parse.ts';

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
`;

describe('scenariosIn', () => {
  it('keeps added and modified scenarios and drops removed ones', () => {
    expect(scenariosIn(delta, 'cache-first')).toEqual([
      {spec: 'cache-first', requirement: 'Keep the value', scenario: 'First read stores it'},
      {spec: 'cache-first', requirement: 'Refresh', scenario: 'Hit returns the stored value'},
    ]);
  });

  it('reads a stable spec under Requirements', () => {
    const text = `## Requirements\n\n### Requirement: End\n\n#### Scenario: End with a numeric end time\n`;
    expect(scenariosIn(text, 'span-end')).toEqual([
      {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
    ]);
  });
});

describe('specIdOf', () => {
  it('uses the directory that holds spec.md', () => {
    expect(specIdOf('openspec/changes/archive/issue-13/specs/span-end/spec.md')).toBe('span-end');
  });
});
