import type {Triple} from './triple.ts';

const REQUIREMENT = '### Requirement: ';
const SCENARIO = '#### Scenario: ';

/** Scenarios under Requirements, ADDED, and MODIFIED. REMOVED is skipped. */
export function scenariosIn(markdown: string, spec: string): Triple[] {
  let keep = false;
  let requirement: string | null = null;
  const found: Triple[] = [];
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim();
      keep =
        heading === 'Requirements' ||
        heading === 'ADDED Requirements' ||
        heading === 'MODIFIED Requirements';
      requirement = null;
      continue;
    }
    if (line.startsWith(REQUIREMENT)) {
      requirement = line.slice(REQUIREMENT.length).trim();
      continue;
    }
    if (keep && requirement && line.startsWith(SCENARIO)) {
      found.push({spec, requirement, scenario: line.slice(SCENARIO.length).trim()});
    }
  }
  return found;
}

/** Directory that holds `spec.md` is the spec id. */
export function specIdOf(file: string): string {
  const parts = file.split('/');
  return parts[parts.length - 2] ?? '';
}
