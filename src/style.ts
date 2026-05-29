import { env } from './utils/env';

export function bold(value: string): string {
  if (env.NO_COLOR) {
    return value;
  }
  return `\x1b[1m${value}\x1b[22m`;
}
