import { Argument, Command } from 'commander';

import Log from './log';
import { bold } from './style';
import {
  type ExpoGoPlatform,
  copyExpoGoToPathAsync,
  downloadExpoGoAsync,
  getExpoGoDownloadUrlAsync,
  isSdkVersionInput,
} from './utils/expoGo';

export type CliDependencies = {
  copyExpoGoToPathAsync: typeof copyExpoGoToPathAsync;
  downloadExpoGoAsync: typeof downloadExpoGoAsync;
  getExpoGoDownloadUrlAsync: typeof getExpoGoDownloadUrlAsync;
  log: (message: string) => void;
};

export const defaultCliDependencies: CliDependencies = {
  copyExpoGoToPathAsync,
  downloadExpoGoAsync,
  getExpoGoDownloadUrlAsync,
  log: Log.log,
};

function platformArgument(description: string): Argument {
  return new Argument('<platform>', description).choices(['ios', 'android']);
}

export function createProgram(
  deps: CliDependencies = defaultCliDependencies,
  { exitOverride = false }: { exitOverride?: boolean } = {}
): Command {
  const program = new Command();

  program
    .name('expo-go')
    .description('Get Expo Go download URLs and binaries')
    .showHelpAfterError()
    .configureOutput({
      writeErr: value => process.stderr.write(value),
      writeOut: value => process.stdout.write(value),
    });

  if (exitOverride) {
    program.exitOverride();
  }

  program
    .command('url')
    .description('print the Expo Go download URL for a platform')
    .addArgument(platformArgument('Platform to get the Expo Go download URL for'))
    .argument('[sdkVersion]', 'Expo SDK version, or "latest". Defaults to the current project SDK, or latest.')
    .action(async (platform: ExpoGoPlatform, sdkVersion?: string) => {
      const { url } = await deps.getExpoGoDownloadUrlAsync(platform, { sdkVersion });
      deps.log(url);
    });

  program
    .command('download')
    .description('download Expo Go for a platform')
    .addArgument(platformArgument('Platform to download Expo Go for'))
    .argument(
      '[sdkVersion]',
      'Expo SDK version to download, or "latest". Defaults to the current project SDK, or latest.'
    )
    .argument(
      '[outputPath]',
      'Output path. Defaults to the current directory. Pass an SDK version (or "latest") to use it.'
    )
    .action(async (platform: ExpoGoPlatform, sdkVersion?: string, outputPath?: string) => {
      if (sdkVersion && !isSdkVersionInput(sdkVersion)) {
        throw new Error(
          `Expected "${sdkVersion}" to be an Expo SDK version or "latest". Pass "latest" as the SDK version to download the default Expo Go to a specific output path.`
        );
      }

      const download = await deps.downloadExpoGoAsync(platform, { sdkVersion });
      const copiedPath = await deps.copyExpoGoToPathAsync({
        destinationPath: outputPath,
        platform,
        sourcePath: download.path,
      });

      deps.log(`Expo Go downloaded to ${bold(copiedPath)}`);
    });

  return program;
}

export async function runCliAsync(
  argv: string[] = process.argv,
  deps: CliDependencies = defaultCliDependencies,
  options?: { exitOverride?: boolean; from?: 'node' | 'user' }
): Promise<void> {
  const program = createProgram(deps, { exitOverride: options?.exitOverride });
  await program.parseAsync(argv, { from: options?.from ?? 'node' });
}
