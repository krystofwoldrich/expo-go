export function bold(value: string): string {
  if (process.env.NO_COLOR) {
    return value;
  }
  return `\x1b[1m${value}\x1b[22m`;
}
