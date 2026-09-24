import {readRegistry, registryDir} from './registry.ts';
import {formatReport, compare, failed} from './report.ts';
import {requiredScenarios} from './tree.ts';

export function coverageBase(): string {
  return process.env.SPEC_COVERAGE_BASE ?? 'origin/master';
}

export function runCheck(root = process.cwd(), base = coverageBase()): string {
  const report = compare(requiredScenarios(root, base), readRegistry(registryDir(root)));
  const text = formatReport(report);
  if (text) {
    console.log(text);
  }
  if (failed(report)) {
    throw new Error('spec coverage has gaps');
  }
  return text;
}
