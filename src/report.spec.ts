import {expect} from 'vitest';

import {compare, failed, formatReport} from './report.ts';
import {requirement, scenario, spec} from './wrap.ts';

const required = [
  {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
  {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
];

spec('coverage-result', () => {
  requirement('A missing required triple fails the check', () => {
    scenario('The missing triple is listed and the check fails', () => {
      const report = compare(required, [
        {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
      ]);
      expect(report.missing).toEqual([
        {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
      ]);
      expect(failed(report)).toBe(true);
      expect(formatReport(report)).toContain('missing span-end / End / Fail with a numeric end time');
    });
  });

  requirement('A registration for another spec fails the check', () => {
    scenario('A triple whose spec id is not required is outside and fails', () => {
      const report = compare(required, [
        ...required,
        {spec: 'other', requirement: 'End', scenario: 'End with a numeric end time'},
      ]);
      expect(report.outside).toEqual([
        {spec: 'other', requirement: 'End', scenario: 'End with a numeric end time'},
      ]);
      expect(failed(report)).toBe(true);
      expect(formatReport(report)).toContain('outside other / End / End with a numeric end time');
    });
  });

  requirement('A near miss does not fail when every required triple is present', () => {
    scenario('A different triple for a required spec is near and the check passes', () => {
      const near = {spec: 'span-end', requirement: 'Wrong', scenario: 'Fail with a numeric end time'};
      const report = compare(required, [...required, near]);
      expect(report.missing).toEqual([]);
      expect(report.near).toEqual([near]);
      expect(failed(report)).toBe(false);
      expect(formatReport(report)).toContain('near span-end / Wrong / Fail with a numeric end time');
    });
  });

  requirement('A complete registration passes', () => {
    scenario('Every required triple registered passes', () => {
      const report = compare(required, required);
      expect(failed(report)).toBe(false);
    });
  });
});
