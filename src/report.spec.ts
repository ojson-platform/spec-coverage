import {describe, expect, it} from 'vitest';

import {compare, failed, formatReport} from './report.ts';

const required = [
  {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
  {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
];

describe('compare', () => {
  it('lists a missing triple and a near registration without failing on the near one alone', () => {
    const report = compare(required, [
      {spec: 'span-end', requirement: 'End', scenario: 'End with a numeric end time'},
      {spec: 'span-end', requirement: 'Wrong', scenario: 'Fail with a numeric end time'},
    ]);
    expect(report.missing).toEqual([
      {spec: 'span-end', requirement: 'End', scenario: 'Fail with a numeric end time'},
    ]);
    expect(report.near).toEqual([
      {spec: 'span-end', requirement: 'Wrong', scenario: 'Fail with a numeric end time'},
    ]);
    expect(report.outside).toEqual([]);
    expect(failed(report)).toBe(true);
    expect(formatReport(report)).toContain('missing span-end / End / Fail with a numeric end time');
    expect(formatReport(report)).toContain('near span-end / Wrong / Fail with a numeric end time');
  });

  it('fails when a registration names a spec outside the tree', () => {
    const report = compare(required, [
      ...required,
      {spec: 'other', requirement: 'End', scenario: 'End with a numeric end time'},
    ]);
    expect(report.missing).toEqual([]);
    expect(report.outside).toEqual([
      {spec: 'other', requirement: 'End', scenario: 'End with a numeric end time'},
    ]);
    expect(failed(report)).toBe(true);
  });

  it('passes when every required triple is registered', () => {
    const report = compare(required, required);
    expect(failed(report)).toBe(false);
  });
});
