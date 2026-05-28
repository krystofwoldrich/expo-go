import { homedir, tmpdir } from 'node:os';
import path from 'node:path';

export function getExpoHomeDirectory(): string {
  if (process.env.EXPO_HOME) {
    return process.env.EXPO_HOME;
  }

  const home = homedir();
  if (!home) {
    throw new Error(
      "Can't determine your home directory; make sure your $HOME environment variable is set."
    );
  }

  if (process.env.EXPO_STAGING) {
    return path.join(home, '.expo-staging');
  } else if (process.env.EXPO_LOCAL) {
    return path.join(home, '.expo-local');
  }
  return path.join(home, '.expo');
}

export function getTmpDirectory(): string {
  return path.join(tmpdir(), 'expo-go');
}
