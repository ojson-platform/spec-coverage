import {runCheck} from './run.ts';

try {
  runCheck();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
