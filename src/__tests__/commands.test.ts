import { describe, expect, it, mock } from 'bun:test';

import { runCliAsync, type CliDependencies } from '../cli';

function createDeps(calls: string[] = []): CliDependencies {
  return {
    copyExpoGoToPathAsync: mock(async () => {
      calls.push('copy');
      return '/output/Exponent-55.apk';
    }),
    downloadExpoGoAsync: mock(async () => {
      calls.push('download');
      return {
        path: '/cache/Exponent-55.apk',
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.apk',
      };
    }),
    getExpoGoDownloadUrlAsync: mock(async () => {
      calls.push('get-url');
      return {
        sdkVersion: '55.0.0',
        url: 'https://example.com/Exponent-55.apk',
      };
    }),
    log: mock(() => {}),
    warn: mock(message => {
      calls.push(`warn:${message}`);
    }),
  };
}

describe('url', () => {
  it('prints the resolved Expo Go URL for the platform and SDK version', async () => {
    const calls: string[] = [];
    const deps = createDeps(calls);

    await runCliAsync(['url', 'android', '55'], deps, { exitOverride: true, from: 'user' });

    expect(calls.slice(0, 2)).toEqual([
      'warn:Resolving the correct Expo Go version...',
      'get-url',
    ]);
    expect(deps.getExpoGoDownloadUrlAsync).toHaveBeenCalledWith('android', {
      sdkVersion: '55',
    });
    expect(deps.log).toHaveBeenCalledWith('https://example.com/Exponent-55.apk');
  });

  it('rejects an SDK version that is not parsable by parseInt or exact "latest"', async () => {
    const calls: string[] = [];
    const deps = createDeps(calls);

    await expect(
      runCliAsync(['url', 'ios', 'LATEST'], deps, { exitOverride: true, from: 'user' })
    ).rejects.toThrow('Expected "LATEST" to be an Expo SDK version or "latest".');

    expect(calls).toEqual([]);
  });
});

describe('download', () => {
  it('downloads an explicit SDK version to an explicit output path', async () => {
    const calls: string[] = [];
    const deps = createDeps(calls);

    await runCliAsync(['download', 'android', '55', '/output'], deps, {
      exitOverride: true,
      from: 'user',
    });

    expect(calls.slice(0, 2)).toEqual([
      'warn:Resolving the correct Expo Go version...',
      'download',
    ]);
    expect(deps.downloadExpoGoAsync).toHaveBeenCalledWith('android', {
      sdkVersion: '55',
    });
    expect(deps.copyExpoGoToPathAsync).toHaveBeenCalledWith({
      destinationPath: '/output',
      platform: 'android',
      sourcePath: '/cache/Exponent-55.apk',
    });
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('/output/Exponent-55.apk'));
  });

  it('downloads the latest Expo Go to an output path when "latest" is passed', async () => {
    const deps = createDeps();

    await runCliAsync(['download', 'ios', 'latest', '/output'], deps, {
      exitOverride: true,
      from: 'user',
    });

    expect(deps.downloadExpoGoAsync).toHaveBeenCalledWith('ios', {
      sdkVersion: 'latest',
    });
    expect(deps.copyExpoGoToPathAsync).toHaveBeenCalledWith({
      destinationPath: '/output',
      platform: 'ios',
      sourcePath: '/cache/Exponent-55.apk',
    });
  });

  it('rejects a second argument that is not an SDK version', async () => {
    const deps = createDeps();

    await expect(
      runCliAsync(['download', 'ios', '/output'], deps, { exitOverride: true, from: 'user' })
    ).rejects.toThrow('Expected "/output" to be an Expo SDK version or "latest"');
  });
});
