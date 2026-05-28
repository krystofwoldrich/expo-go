import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
  normalizeSdkVersion,
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
let originalExpoHome: string | undefined;
let originalHome: string | undefined;

describe('expoGo utils', () => {
  beforeEach(async () => {
    tempHome = await mkTempDirAsync();
    originalFetch = globalThis.fetch;
    originalExpoHome = process.env.EXPO_HOME;
    originalHome = process.env.HOME;
    process.env.EXPO_HOME = path.join(tempHome, '.expo');
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
    if (originalExpoHome === undefined) {
      delete process.env.EXPO_HOME;
    } else {
      process.env.EXPO_HOME = originalExpoHome;
    }
    mock.restore();
    await rm(tempHome, { force: true, recursive: true });
  });

  describe(normalizeSdkVersion, () => {
    it('normalizes SDK major versions', () => {
      expect(normalizeSdkVersion('55')).toBe('55.0.0');
      expect(normalizeSdkVersion('55.1')).toBe('55.1.0');
      expect(normalizeSdkVersion('55.0.0')).toBe('55.0.0');
      expect(normalizeSdkVersion('UNVERSIONED')).toBe('UNVERSIONED');
    });
  });

  describe(getLatestSdkVersion, () => {
    it('returns the highest semver SDK version', () => {
      expect(getLatestSdkVersion(versions.sdkVersions)).toBe('55.0.0');
    });
  });

  describe(getExpoGoVersionEntryFromVersions, () => {
    it('supports UNVERSIONED by resolving to the latest SDK version', () => {
      const result = getExpoGoVersionEntryFromVersions('UNVERSIONED', versions);

      expect(result.sdkVersion).toBe('55.0.0');
      expect(Log.warn).toHaveBeenCalledWith(expect.stringContaining('55.0.0'));
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
  });
});

async function mkTempDirAsync(): Promise<string> {
  const prefix = path.join(tmpdir(), 'expo-go-test-');
  return await mkdtemp(prefix);
}
