import {runCheck} from './run.ts';

/** Vitest reporter. Prints gaps after the run, including when a test failed. */
export default class SpecCoverageReporter {
  onTestRunEnd(): void {
    runCheck();
  }
}
