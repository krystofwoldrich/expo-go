import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import Log from '../../log';
import * as downloadUtils from '../download';
import {
  type ExpoVersions,
  downloadExpoGoAsync,
  getExpoGoDownloadUrlAsync,
  getExpoGoVersionEntryFromVersions,
  getLatestSdkVersion,
} from '../expoGo';

const versions: ExpoVersions = {
  sdkVersions: {
    '54.0.0': {
      androidClientUrl: 'https://example.com/Exponent-54.apk',
      iosClientUrl: 'https://example.com/Exponent-54.tar.gz',
    },
    '55.0.0': {
      androidClientUrl: 'https://example.com/Exponent-55.apk',
      iosClientUrl: 'https://example.com/Exponent-55.tar.gz',
    },
  },
};

let tempHome: string;
let originalFetch: typeof fetch;
let originalExpoHomeDirectory: string | undefined;
let originalHome: string | undefined;

describe('expoGo utils', () => {
  beforeEach(async () => {
    tempHome = await mkTempDirAsync();
    originalFetch = globalThis.fetch;
    originalExpoHomeDirectory = process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
    originalHome = process.env.HOME;
    process.env.__UNSAFE_EXPO_HOME_DIRECTORY = path.join(tempHome, '.expo');
    process.env.HOME = tempHome;
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ data: versions }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      });
    }) as unknown as typeof fetch;
    spyOn(Log, 'debug').mockImplementation(() => {});
    spyOn(Log, 'log').mockImplementation(() => {});
    spyOn(Log, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    if (originalExpoHomeDirectory === undefined) {
      delete process.env.__UNSAFE_EXPO_HOME_DIRECTORY;
    } else {
      process.env.__UNSAFE_EXPO_HOME_DIRECTORY = originalExpoHomeDirectory;
    }
    mock.restore();
    await rm(tempHome, { force: true, recursive: true });
  });

  describe(getLatestSdkVersion, () => {
    it('returns the highest SDK major version', () => {
      expect(getLatestSdkVersion(versions.sdkVersions)).toBe('55.0.0');
    });
  });

  describe(getExpoGoVersionEntryFromVersions, () => {
    it('resolves SDK inputs through parseInt', () => {
      const result = getExpoGoVersionEntryFromVersions('55.0.0', versions);

      expect(result.sdkVersion).toBe('55.0.0');
    });

    it('supports "latest" by resolving to the latest SDK version without warning', () => {
      const result = getExpoGoVersionEntryFromVersions('latest', versions);

      expect(result.sdkVersion).toBe('55.0.0');
      expect(Log.warn).not.toHaveBeenCalled();
    });

    it('throws when the SDK version is missing', () => {
      expect(() => getExpoGoVersionEntryFromVersions('53', versions)).toThrow(
        'Unable to find a version of Expo Go for SDK 53.0.0'
      );
    });

    it('rejects SDK versions that are not parsable by parseInt or exact "latest"', () => {
      expect(() => getExpoGoVersionEntryFromVersions('LATEST', versions)).toThrow(
        'Expected "LATEST" to be an Expo SDK version or "latest".'
      );
      expect(() => getExpoGoVersionEntryFromVersions('UNVERSIONED', versions)).toThrow(
        'Expected "UNVERSIONED" to be an Expo SDK version or "latest".'
      );
    });
  });

  describe(getExpoGoDownloadUrlAsync, () => {
    it('resolves the platform URL for an explicit SDK major version', async () => {
      await expect(getExpoGoDownloadUrlAsync('ios', { sdkVersion: '55' })).resolves.toEqual({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.tar.gz',
      });
    });

    it('uses the current project SDK version when no SDK argument is provided', async () => {
      const projectDir = await mkTempDirAsync();
      await writeFile(
        path.join(projectDir, 'app.json'),
        JSON.stringify({ expo: { sdkVersion: '54.0.0' } })
      );

      await expect(getExpoGoDownloadUrlAsync('android', { projectDir })).resolves.toEqual({
        sdkVersion: '54.0.0',
        url: 'https://example.com/Exponent-54.apk',
      });

      await rm(projectDir, { force: true, recursive: true });
    });

    it('falls back to the latest SDK version when no project SDK is available', async () => {
      await expect(getExpoGoDownloadUrlAsync('android')).resolves.toEqual({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.apk',
      });
    });

    it('resolves the latest SDK version when "latest" is provided', async () => {
      await expect(getExpoGoDownloadUrlAsync('ios', { sdkVersion: 'latest' })).resolves.toEqual({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.tar.gz',
      });
    });

    it('caches version responses in the Expo home directory', async () => {
      await expect(getExpoGoDownloadUrlAsync('android', { sdkVersion: '55' })).resolves.toEqual({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.apk',
      });
      await expect(getExpoGoDownloadUrlAsync('ios', { sdkVersion: '54' })).resolves.toEqual({
        sdkVersion: '54.0.0',
        url: 'https://example.com/Exponent-54.tar.gz',
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe(downloadExpoGoAsync, () => {
    it('extracts iOS tarballs directly into the app cache directory', async () => {
      spyOn(downloadUtils, 'downloadFileWithProgressTrackerAsync').mockResolvedValue();
      const extractArchiveSpy = spyOn(downloadUtils, 'extractArchiveAsync').mockResolvedValue();

      await expect(downloadExpoGoAsync('ios', { sdkVersion: '55' })).resolves.toMatchObject({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.tar.gz',
      });

      expect(extractArchiveSpy).toHaveBeenCalledWith(
        expect.stringContaining('Exponent-55.tar.gz'),
        expect.stringContaining('Exponent-55.tar.app')
      );
    });

    it('logs the cache directory instead of the cached app path', async () => {
      await mkdir(
        path.join(tempHome, '.expo', 'ios-simulator-app-cache', 'Exponent-55.tar.app'),
        { recursive: true }
      );

      await expect(downloadExpoGoAsync('ios', { sdkVersion: '55' })).resolves.toMatchObject({
        sdkVersion: '55.0.0',
      });

      expect(Log.log).toHaveBeenCalledWith(
        expect.stringMatching(/^Using cached version from .*ios-simulator-app-cache/)
      );
      expect(Log.log).not.toHaveBeenCalledWith(expect.stringContaining('Exponent-55.tar.app'));
    });

    it('writes the Android apk straight to the platform cache without an intermediate copy', async () => {
      const downloadSpy = spyOn(
        downloadUtils,
        'downloadFileWithProgressTrackerAsync'
      ).mockResolvedValue();
      const extractArchiveSpy = spyOn(downloadUtils, 'extractArchiveAsync').mockResolvedValue();

      await expect(downloadExpoGoAsync('android', { sdkVersion: '55' })).resolves.toMatchObject({
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.apk',
      });

      expect(downloadSpy).toHaveBeenCalledWith(
        'https://example.com/Exponent-55.apk',
        expect.stringMatching(/android-apk-cache.*Exponent-55\.apk$/),
        expect.any(Function),
        'Successfully downloaded Expo Go',
        expect.objectContaining({ showNewLine: false })
      );
      expect(extractArchiveSpy).not.toHaveBeenCalled();
    });

    it('restores Android apk downloads from the response cache without refetching', async () => {
      let fetchCalls = 0;
      globalThis.fetch = mock(async () => {
        fetchCalls++;
        if (fetchCalls > 1) {
          throw new Error('Network should not be used after the response is cached.');
        }
        return new Response('apk contents', {
          headers: { 'content-length': '12' },
          status: 200,
        });
      }) as unknown as typeof fetch;

      const firstDownload = await downloadExpoGoAsync('android', {
        sdkVersion: '55',
        url: 'https://example.com/Exponent-55.apk',
      });
      expect(await readFile(firstDownload.path, 'utf8')).toBe('apk contents');

      await rm(firstDownload.path, { force: true, recursive: true });

      const secondDownload = await downloadExpoGoAsync('android', {
        sdkVersion: '55',
        url: 'https://example.com/Exponent-55.apk',
      });

      expect(secondDownload.path).toBe(firstDownload.path);
      expect(await readFile(secondDownload.path, 'utf8')).toBe('apk contents');
      expect(fetchCalls).toBe(1);
    });
  });
});

async function mkTempDirAsync(): Promise<string> {
  const prefix = path.join(tmpdir(), 'expo-go-test-');
  return await mkdtemp(prefix);
}
