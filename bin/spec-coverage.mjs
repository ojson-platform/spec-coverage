import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsx = createRequire(path.join(root, 'package.json')).resolve('tsx/cli');
const result = spawnSync(
  process.execPath,
  [tsx, '--tsconfig', path.join(root, 'tsconfig.json'), path.join(root, 'src', 'cli.ts')],
  {stdio: 'inherit'},
);
process.exit(result.status ?? 1);
