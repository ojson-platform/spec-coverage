import {rmSync} from 'node:fs';

import {registryDir} from './registry.ts';

export function resetRegistry(root?: string): void {
  rmSync(registryDir(root), {recursive: true, force: true});
}

export default function setup(): void {
  resetRegistry();
}
