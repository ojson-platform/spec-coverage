import {tripleKey, type Triple} from './triple.ts';

export type Report = {
  missing: Triple[];
  near: Triple[];
  outside: Triple[];
};

export function compare(required: readonly Triple[], registered: readonly Triple[]): Report {
  const requiredKeys = new Set(required.map(tripleKey));
  const specIds = new Set(required.map(triple => triple.spec));
  const registeredKeys = new Set(registered.map(tripleKey));
  const missing = required.filter(triple => !registeredKeys.has(tripleKey(triple)));
  const near: Triple[] = [];
  const outside: Triple[] = [];
  for (const triple of registered) {
    if (requiredKeys.has(tripleKey(triple))) {
      continue;
    }
    if (specIds.has(triple.spec)) {
      near.push(triple);
    } else {
      outside.push(triple);
    }
  }
  return {missing, near, outside};
}

function line(triple: Triple): string {
  return `${triple.spec} / ${triple.requirement} / ${triple.scenario}`;
}

export function formatReport(report: Report): string {
  const lines: string[] = [];
  for (const triple of report.missing) {
    lines.push(`missing ${line(triple)}`);
  }
  for (const triple of report.near) {
    lines.push(`near ${line(triple)}`);
  }
  for (const triple of report.outside) {
    lines.push(`outside ${line(triple)}`);
  }
  return lines.join('\n');
}

/** A missing scenario or a registration outside the tree fails the check. */
export function failed(report: Report): boolean {
  return report.missing.length > 0 || report.outside.length > 0;
}
