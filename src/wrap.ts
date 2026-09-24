import {describe, it} from 'vitest';

import {recordTriple} from './registry.ts';
import type {Triple} from './triple.ts';

type Frame = {spec?: string; requirement?: string};

const current: Frame = {};

function frame(): Triple {
  if (!current.spec) {
    throw new Error('scenario() must be called inside spec()');
  }
  if (!current.requirement) {
    throw new Error('scenario() must be called inside requirement()');
  }
  return {spec: current.spec, requirement: current.requirement, scenario: ''};
}

export function spec(id: string, body: () => void): void {
  describe(id, () => {
    const previous = current.spec;
    current.spec = id;
    try {
      body();
    } finally {
      current.spec = previous;
    }
  });
}

export function requirement(title: string, body: () => void): void {
  const specId = current.spec;
  describe(title, () => {
    const previousSpec = current.spec;
    const previous = current.requirement;
    current.spec = specId;
    current.requirement = title;
    try {
      body();
    } finally {
      current.spec = previousSpec;
      current.requirement = previous;
    }
  });
}

export function scenario(title: string, body: () => void | Promise<void>): void {
  const triple = {...frame(), scenario: title};
  recordTriple(triple);
  it(title, body);
}

scenario.skip = (title: string, body: () => void | Promise<void>): void => {
  it.skip(title, body);
};
