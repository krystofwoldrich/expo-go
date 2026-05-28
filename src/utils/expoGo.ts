import { cp, lstat, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

import semver from 'semver';

import { apiGetAsync } from '../api';
import Log from '../log';
import { bold } from '../style';
import * as downloadUtils from './download';
import type { FetchLike } from './download';
import { formatBytes } from './files';
import { getExpoHomeDirectory, getTmpDirectory } from './paths';

export type ExpoGoPlatform = 'ios' | 'android';

export type SDKVersion = {
  iosClientUrl?: string;
  androidClientUrl?: string;
  iosClientVersion?: string;
  androidClientVersion?: string;
  beta?: boolean;
  [key: string]: unknown;
};

export type ExpoVersions = {
  sdkVersions: Record<string, SDKVersion>;
};

const SIX_MONTHS_IN_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// Mirrors @expo/cli's platform settings for Expo Go downloads, with the
// standalone CLI addition of an output extension for copy/download commands.
const platformSettings = {
  ios: {
    versionsKey: 'iosClientUrl',
    extension: 'app',
    shouldExtractResults: true,
    getFilePath: (filename: string) =>
      path.join(getExpoHomeDirectory(), 'ios-simulator-app-cache', `${filename}.app`),
  },
  android: {
    versionsKey: 'androidClientUrl',
    extension: 'apk',
    shouldExtractResults: false,
    getFilePath: (filename: string) =>
      path.join(getExpoHomeDirectory(), 'android-apk-cache', `${filename}.apk`),
  },
} as const;

function getUrlBasename(url: string): string {
  try {
    return path.basename(new URL(url).pathname);
  } catch {
    return path.basename(url.split('?')[0] ?? url);
  }
}

function formatHomePath(filePath: string): string {
  const homeDirectory = homedir();
  if (!homeDirectory || !filePath.startsWith(homeDirectory)) {
    return filePath;
  }
  return path.join('~', path.relative(homeDirectory, filePath));
}

async function pathExistsAsync(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonConfigAsync(filePath: string): Promise<unknown | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return null;
  }

  try {
    return await file.json();
  } catch {
    return null;
  }
}

export async function detectProjectSdkVersionAsync(
  projectDir: string
): Promise<string | undefined> {
  const candidates = ['app.json', 'app.config.json'];
  for (const candidate of candidates) {
    const config = await readJsonConfigAsync(path.join(projectDir, candidate));
    if (!config || typeof config !== 'object') {
      continue;
    }

    const maybeExpoConfig = 'expo' in config ? (config as { expo?: unknown }).expo : config;
    if (
      maybeExpoConfig &&
      typeof maybeExpoConfig === 'object' &&
      'sdkVersion' in maybeExpoConfig &&
      typeof maybeExpoConfig.sdkVersion === 'string'
    ) {
      return maybeExpoConfig.sdkVersion;
    }
  }
}

export function normalizeSdkVersion(sdkVersion: string): string {
  if (sdkVersion.toUpperCase() === 'UNVERSIONED') {
    return 'UNVERSIONED';
  } else if (/^\d+$/.test(sdkVersion)) {
    return `${sdkVersion}.0.0`;
  } else if (/^\d+\.\d+$/.test(sdkVersion)) {
    return `${sdkVersion}.0`;
  }
  return sdkVersion;
}

export function isSdkVersionInput(value: string): boolean {
  const normalized = value.toUpperCase();
  return normalized === 'UNVERSIONED' || normalized === 'LATEST' || /^\d+(\.\d+){0,2}$/.test(value);
}

export async function getVersionsAsync(): Promise<ExpoVersions> {
  const response = await apiGetAsync('versions/latest');
  const data = response && typeof response === 'object' && 'data' in response ? response.data : response;
  if (
    !data ||
    typeof data !== 'object' ||
    !('sdkVersions' in data) ||
    typeof data.sdkVersions !== 'object' ||
    !data.sdkVersions
  ) {
    throw new Error('Unexpected response when fetching version info from Expo servers.');
  }
  return data as ExpoVersions;
}

export function getLatestSdkVersion(sdkVersions: Record<string, SDKVersion>): string {
  const latestVersion = Object.keys(sdkVersions)
    .filter(version => semver.valid(version))
    .reduce((latest, version) => (semver.gt(version, latest) ? version : latest), '0.0.0');

  if (latestVersion === '0.0.0') {
    throw new Error('Unable to find a version of Expo Go.');
  }
  return latestVersion;
}

export function getExpoGoVersionEntryFromVersions(
  sdkVersion: string,
  versions: ExpoVersions
): { sdkVersion: string; version: SDKVersion } {
  const normalizedSdkVersion = normalizeSdkVersion(sdkVersion);
  const upperSdkVersion = normalizedSdkVersion.toUpperCase();
  const resolvesToLatest = upperSdkVersion === 'UNVERSIONED' || upperSdkVersion === 'LATEST';
  const resolvedSdkVersion = resolvesToLatest
    ? getLatestSdkVersion(versions.sdkVersions)
    : normalizedSdkVersion;

  if (upperSdkVersion === 'UNVERSIONED') {
    Log.warn(
      `Downloading the latest Expo Go client (${resolvedSdkVersion}). This will not fully conform to UNVERSIONED.`
    );
  }

  const version = versions.sdkVersions[resolvedSdkVersion];
  if (!version) {
    throw new Error(`Unable to find a version of Expo Go for SDK ${normalizedSdkVersion}`);
  }
  return { sdkVersion: resolvedSdkVersion, version };
}

export async function getExpoGoVersionEntryAsync(
  sdkVersion: string
): Promise<{ sdkVersion: string; version: SDKVersion }> {
  return getExpoGoVersionEntryFromVersions(sdkVersion, await getVersionsAsync());
}

export async function getExpoGoDownloadUrlAsync(
  platform: ExpoGoPlatform,
  {
    projectDir = process.cwd(),
    sdkVersion,
  }: {
    projectDir?: string;
    sdkVersion?: string;
  } = {}
): Promise<{ sdkVersion: string; url: string }> {
  const versions = await getVersionsAsync();
  const resolvedSdkVersion = sdkVersion
    ? normalizeSdkVersion(sdkVersion)
    : normalizeSdkVersion(
        (await detectProjectSdkVersionAsync(projectDir)) ?? getLatestSdkVersion(versions.sdkVersions)
      );
  const { sdkVersion: matchingSdkVersion, version } = getExpoGoVersionEntryFromVersions(
    resolvedSdkVersion,
    versions
  );
  const versionsKey = platformSettings[platform].versionsKey;
  const url = version[versionsKey];
  if (typeof url !== 'string' || !url) {
    throw new Error(
      `Unable to find an Expo Go ${platform} download URL for SDK ${matchingSdkVersion}`
    );
  }
  return { sdkVersion: matchingSdkVersion, url };
}

export async function cleanupOldExpoGoCacheEntriesAsync(
  cacheDirectory: string,
  maxAgeMs: number = SIX_MONTHS_IN_MS
): Promise<void> {
  let cacheEntries: string[];
  try {
    cacheEntries = await readdir(cacheDirectory);
  } catch {
    return;
  }

  const now = Date.now();
  for (const entry of cacheEntries) {
    const filePath = path.join(cacheDirectory, entry);
    try {
      const fileStat = await lstat(filePath);
      if (now - fileStat.mtimeMs > maxAgeMs) {
        Log.debug(`Removing old Expo Go cache entry: ${filePath}`);
        await rm(filePath, { force: true, recursive: true });
      }
    } catch {
      // Keep cleanup best-effort so a stale entry never blocks a download.
    }
  }
}

export async function downloadExpoGoAsync(
  platform: ExpoGoPlatform,
  {
    projectDir = process.cwd(),
    sdkVersion,
    url,
  }: {
    projectDir?: string;
    sdkVersion?: string;
    url?: string;
  } = {}
): Promise<{ path: string; sdkVersion: string; url: string }> {
  const result = url
    ? { sdkVersion: sdkVersion ? normalizeSdkVersion(sdkVersion) : 'unknown', url }
    : await getExpoGoDownloadUrlAsync(platform, { projectDir, sdkVersion });

  const { getFilePath, shouldExtractResults } = platformSettings[platform];
  const filename = path.parse(getUrlBasename(result.url)).name;
  const outputPath = getFilePath(filename);

  await cleanupOldExpoGoCacheEntriesAsync(path.dirname(outputPath));
  if (await pathExistsAsync(outputPath)) {
    Log.log(`Using cached version from ${bold(formatHomePath(path.dirname(outputPath)))}`);
    return { ...result, path: outputPath };
  }

  await downloadAppAsync({
    extract: shouldExtractResults,
    outputPath,
    url: result.url,
  });

  return { ...result, path: outputPath };
}

async function downloadAppAsync({
  url,
  outputPath,
  extract,
}: {
  url: string;
  outputPath: string;
  extract: boolean;
}): Promise<void> {
  const fetchInstance: FetchLike = fetch;
  const progressMessage = (ratio: number, total: number): string =>
    `Downloading Expo Go (${formatBytes(total * ratio)} / ${formatBytes(total)})`;

  if (extract) {
    const tmpDir = path.join(getTmpDirectory(), crypto.randomUUID());
    await mkdir(tmpDir, { recursive: true });
    const tmpPath = path.join(tmpDir, getUrlBasename(url));
    await downloadUtils.downloadFileWithProgressTrackerAsync(
      url,
      tmpPath,
      progressMessage,
      'Successfully downloaded Expo Go',
      { showNewLine: false, fetch: fetchInstance }
    );

    await rm(outputPath, { force: true, recursive: true });
    await mkdir(outputPath, { recursive: true });
    await downloadUtils.extractArchiveAsync(tmpPath, outputPath);
  } else {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await downloadUtils.downloadFileWithProgressTrackerAsync(
      url,
      outputPath,
      progressMessage,
      'Successfully downloaded Expo Go',
      { showNewLine: false, fetch: fetchInstance }
    );
  }
}

export async function copyExpoGoToPathAsync({
  destinationPath,
  platform,
  sourcePath,
}: {
  destinationPath?: string;
  platform: ExpoGoPlatform;
  sourcePath: string;
}): Promise<string> {
  const outputPath = await resolveExpoGoOutputPathAsync({
    destinationPath,
    platform,
    sourcePath,
  });

  if (path.resolve(sourcePath) === path.resolve(outputPath)) {
    return outputPath;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await rm(outputPath, { force: true, recursive: true });
  await cp(sourcePath, outputPath, { recursive: true });
  return outputPath;
}

async function resolveExpoGoOutputPathAsync({
  destinationPath,
  platform,
  sourcePath,
}: {
  destinationPath?: string;
  platform: ExpoGoPlatform;
  sourcePath: string;
}): Promise<string> {
  if (!destinationPath) {
    return path.join(process.cwd(), path.basename(sourcePath));
  }

  const resolvedDestinationPath = path.resolve(destinationPath);
  const extension = platformSettings[platform].extension;
  if (resolvedDestinationPath.endsWith(`.${extension}`)) {
    return resolvedDestinationPath;
  }

  const destinationStat = await stat(resolvedDestinationPath).catch(() => null);
  if (!destinationStat || destinationStat.isDirectory()) {
    return path.join(resolvedDestinationPath, path.basename(sourcePath));
  }

  return resolvedDestinationPath;
}
