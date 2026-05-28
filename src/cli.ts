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

type RunCliOptions = {
  // Kept for test and caller compatibility with the previous Commander wrapper.
  exitOverride?: boolean;
  from?: 'node' | 'user';
};

export const defaultCliDependencies: CliDependencies = {
  copyExpoGoToPathAsync,
  downloadExpoGoAsync,
  getExpoGoDownloadUrlAsync,
  log: Log.log,
};

const HELP = `Usage: expo-go [command]

Get Expo Go download URLs and binaries

Commands:
  url <platform> [sdkVersion]                    print the Expo Go download URL for a platform
  download <platform> [sdkVersion] [outputPath]  download Expo Go for a platform

Run "expo-go help <command>" for command details.`;

const COMMAND_HELP = {
  url: `Usage: expo-go url <platform> [sdkVersion]

Print the Expo Go download URL for a platform.

Arguments:
  platform    ios or android
  sdkVersion  Expo SDK version, or "latest". Defaults to the current project SDK, or latest.`,
  download: `Usage: expo-go download <platform> [sdkVersion] [outputPath]

Download Expo Go for a platform.

Arguments:
  platform    ios or android
  sdkVersion  Expo SDK version, or "latest". Defaults to the current project SDK, or latest.
  outputPath  Output path. Defaults to the current directory. Pass an SDK version (or "latest") to use it.`,
} as const;

function toUserArgs(argv: string[], from: RunCliOptions['from']): string[] {
  return from === 'user' ? argv : argv.slice(2);
}

function assertPlatform(value: string | undefined): ExpoGoPlatform {
  if (value === 'ios' || value === 'android') {
    return value;
  }
  throw new Error('Expected platform to be "ios" or "android".');
}

function isHelpToken(value: string | undefined): boolean {
  return value === '-h' || value === '--help';
}

function assertNoExtraArgs(command: string, args: string[], max: number): void {
  if (args.length > max) {
    throw new Error(`Too many arguments for "${command}".`);
  }
}

export async function runCliAsync(
  argv: string[] = process.argv,
  deps: CliDependencies = defaultCliDependencies,
  options?: RunCliOptions
): Promise<void> {
  void options?.exitOverride;

  const [command, ...args] = toUserArgs(argv, options?.from);

  if (!command || isHelpToken(command)) {
    deps.log(HELP);
    return;
  }

  if (command === 'help') {
    const commandName = args[0] as keyof typeof COMMAND_HELP | undefined;
    deps.log(commandName && COMMAND_HELP[commandName] ? COMMAND_HELP[commandName] : HELP);
    return;
  }

  if (command === 'url') {
    if (isHelpToken(args[0])) {
      deps.log(COMMAND_HELP.url);
      return;
    }
    assertNoExtraArgs(command, args, 2);
    const platform = assertPlatform(args[0]);
    const sdkVersion = args[1];
    const { url } = await deps.getExpoGoDownloadUrlAsync(platform, { sdkVersion });
    deps.log(url);
    return;
  }

  if (command === 'download') {
    if (isHelpToken(args[0])) {
      deps.log(COMMAND_HELP.download);
      return;
    }
    assertNoExtraArgs(command, args, 3);
    const platform = assertPlatform(args[0]);
    const sdkVersion = args[1];
    const outputPath = args[2];
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
    return;
  }

  throw new Error(`Unknown command "${command}".`);
}
