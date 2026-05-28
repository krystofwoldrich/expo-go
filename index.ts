#!/usr/bin/env bun

import { runCliAsync } from './src/cli';

export * from './src/cli';
export * from './src/utils/expoGo';

if (import.meta.main) {
  try {
    await runCliAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}
