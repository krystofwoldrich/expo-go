# expo-go

Download Expo Go binaries, or print the resolved download URL, from a tiny standalone CLI.

## Usage

```bash
npx expo-go url <ios|android> [sdkVersion|latest]
npx expo-go download <ios|android> [sdkVersion|latest] [outputPath]
```

Examples:

```bash
npx expo-go url android 55
npx expo-go url ios latest
npx expo-go download android 55 ./downloads
npx expo-go download ios latest ./ExpoGo.app
```

When no SDK version is provided, the CLI tries to read the current project SDK from `app.json` or `app.config.json`, then falls back to the latest Expo Go version. If you want to pass an output path without choosing a specific SDK, pass `latest` as the SDK argument.

Downloaded binaries are cached under the Expo home directory:

- Android APKs: `~/.expo/android-apk-cache`
- iOS simulator apps: `~/.expo/ios-simulator-app-cache`

Expo API and download responses are cached under `~/.expo/versions-cache` and `~/.expo/expo-go`. Set `EXPO_NO_CACHE=1` to skip response caching.

## Commands

### `expo-go url`

Prints the Expo Go download URL for a platform and optional SDK version.

```bash
npx expo-go url android 55
```

### `expo-go download`

Downloads Expo Go for a platform and optional SDK version, then copies it to the requested output path. If the output path is a directory, the downloaded file or app bundle keeps its resolved Expo Go filename.

```bash
npx expo-go download android latest ./downloads
```

## Development

Install dependencies:

```bash
bun install
```

Run the CLI locally:

```bash
bun ./index.ts url android latest
```

Run tests:

```bash
bun test
```

Build the distributable CLI bundle:

```bash
bun run build
```
