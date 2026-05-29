import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createFetch } from '../fetch';
import { downloadFileWithProgressTrackerAsync } from '../download';

let tempHome: string;
let originalExpoHomeDirectory: string | undefined;

describe(downloadFileWithProgressTrackerAsync, () => {
  beforeEach(async () => {
    tempHome = await mkTempDirAsync();
    originalExpoHomeDirectory = process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
    process.env.__UNSAFE_EXPO_HOME_DIRECTORY = path.join(tempHome, '.expo');
  });

  afterEach(async () => {
    if (originalExpoHomeDirectory === undefined) {
      delete process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
    } else {
      process.env.__UNSAFE_EXPO_HOME_DIRECTORY = originalExpoHomeDirectory;
    }
    mock.restore();
    await rm(tempHome, { force: true, recursive: true });
  });

  it('renders progress while a cached fetch is filling the response cache', async () => {
    const originalIsTTY = process.stderr.isTTY;
    const writes: string[] = [];
    Object.defineProperty(process.stderr, 'isTTY', { configurable: true, value: true });
    spyOn(process.stderr, 'write').mockImplementation(
      (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void) => {
        writes.push(String(chunk));
        const done = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
        done?.();
        return true;
      }
    );

    try {
      const fetchInstance = createFetch({
        cacheDirectory: 'download-cache-test',
        fetch: mock(async () => {
          return new Response('downloaded', {
            headers: { 'content-length': '10' },
            status: 200,
          });
        }),
      });
      const outputPath = path.join(tempHome, 'Exponent.apk');

      await downloadFileWithProgressTrackerAsync(
        'https://example.com/Exponent.apk',
        outputPath,
        (ratio, total) => `Downloading Expo Go (${Math.round(ratio * total)} / ${total})`,
        'Successfully downloaded Expo Go',
        { fetch: fetchInstance, showNewLine: false }
      );

      expect(await readFile(outputPath, 'utf8')).toBe('downloaded');
      expect(
        writes.filter(message => message === 'Downloading Expo Go (10 / 10)')
      ).toHaveLength(1);
      expect(writes).toContain('Successfully downloaded Expo Go\n');
    } finally {
      Object.defineProperty(process.stderr, 'isTTY', {
        configurable: true,
        value: originalIsTTY,
      });
    }
  });

  it('renders progress when the response cache is disabled', async () => {
    const originalIsTTY = process.stderr.isTTY;
    const writes: string[] = [];
    Object.defineProperty(process.stderr, 'isTTY', { configurable: true, value: true });
    spyOn(process.stderr, 'write').mockImplementation(
      (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void) => {
        writes.push(String(chunk));
        const done = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
        done?.();
        return true;
      }
    );

    try {
      const fetchInstance = createFetch({
        cacheDirectory: 'download-cache-test',
        fetch: mock(async () => {
          return new Response('downloaded', {
            headers: { 'content-length': '10' },
            status: 200,
          });
        }),
        skipCache: true,
      });
      const outputPath = path.join(tempHome, 'Exponent-no-cache.apk');

      await downloadFileWithProgressTrackerAsync(
        'https://example.com/Exponent.apk',
        outputPath,
        (ratio, total) => `Downloading Expo Go (${Math.round(ratio * total)} / ${total})`,
        'Successfully downloaded Expo Go',
        { fetch: fetchInstance, showNewLine: false }
      );

      expect(await readFile(outputPath, 'utf8')).toBe('downloaded');
      expect(
        writes.filter(message => message === 'Downloading Expo Go (10 / 10)')
      ).toHaveLength(1);
      expect(writes).toContain('Successfully downloaded Expo Go\n');
    } finally {
      Object.defineProperty(process.stderr, 'isTTY', {
        configurable: true,
        value: originalIsTTY,
      });
    }
  });
});

async function mkTempDirAsync(): Promise<string> {
  const prefix = path.join(tmpdir(), 'expo-go-download-test-');
  return await mkdtemp(prefix);
}
