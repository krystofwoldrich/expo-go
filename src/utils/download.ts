import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { clearLine, cursorTo } from 'node:readline';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type { FetchLike, ProgressCallback } from './fetch';
// Mirrors @expo/cli's standalone tar extraction utility:
// https://github.com/expo/expo/blob/2c21e2f96ce6aede3d6bb5c780f0964d2116d37b/packages/@expo/cli/src/utils/tar.ts#L136-L146
import { extractAsync } from './tar';

export type { FetchLike };

const PROGRESS_RENDER_INTERVAL_MS = 100;

export async function downloadFileWithProgressTrackerAsync(
  url: string,
  outputPath: string,
  progressTrackerMessage: string | ((ratio: number, total: number) => string),
  progressTrackerCompletedMessage: string,
  { showNewLine = true, fetch: fetchInstance = fetch }: { showNewLine?: boolean; fetch?: FetchLike } = {}
): Promise<void> {
  let didRenderProgress = false;
  let didReceiveFetchProgress = false;
  let lastProgressRenderTime = 0;
  const renderProgress = (message: string): void => {
    if (!process.stderr.isTTY) {
      return;
    }
    if (!didRenderProgress && showNewLine) {
      process.stderr.write('\n');
    }
    didRenderProgress = true;
    clearLine(process.stderr, 0);
    cursorTo(process.stderr, 0);
    process.stderr.write(message);
  };
  const maybeRenderProgress = (message: string, isFinal = false): void => {
    const now = Date.now();
    if (!isFinal && now - lastProgressRenderTime < PROGRESS_RENDER_INTERVAL_MS) {
      return;
    }
    lastProgressRenderTime = now;
    renderProgress(message);
  };
  const reportProgress = (loaded: number, total: number): void => {
    if (typeof progressTrackerMessage !== 'function' || !Number.isFinite(total) || total <= 0) {
      return;
    }
    maybeRenderProgress(
      progressTrackerMessage(Math.min(loaded / total, 1), total),
      loaded >= total
    );
  };
  const onProgress: ProgressCallback | undefined =
    typeof progressTrackerMessage === 'function'
      ? ({ loaded, total }) => {
          didReceiveFetchProgress = Number.isFinite(total) && total > 0;
          reportProgress(loaded, total);
        }
      : undefined;

  try {
    await mkdir(path.dirname(outputPath), { recursive: true });

    const response = await fetchInstance(url, {
      signal: AbortSignal.timeout(1000 * 60 * 5),
      onProgress,
    });
    if (!response.ok) {
      throw new Error(`Failed to download file from ${url}`);
    }

    if (!response.body) {
      throw new Error(`Failed to download file from ${url}`);
    }

    const total = Number(response.headers.get('content-length'));
    let downloaded = 0;
    const progressStream = new Transform({
      transform(chunk: Buffer | string, encoding, callback) {
        downloaded += typeof chunk === 'string' ? Buffer.byteLength(chunk, encoding) : chunk.byteLength;
        if (!didReceiveFetchProgress) {
          reportProgress(downloaded, total);
        }
        callback(null, chunk);
      },
    });

    if (typeof progressTrackerMessage === 'string') {
      maybeRenderProgress(progressTrackerMessage);
    }

    await pipeline(
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
      progressStream,
      createWriteStream(outputPath)
    );
    if (didRenderProgress) {
      clearLine(process.stderr, 0);
      cursorTo(process.stderr, 0);
      process.stderr.write(`${progressTrackerCompletedMessage}\n`);
    }
  } catch (error) {
    if (didRenderProgress) {
      process.stderr.write('\n');
    }
    await rm(outputPath, { force: true, recursive: true });
    throw error;
  }
}

export async function extractArchiveAsync(input: string, output: string): Promise<void> {
  await extractAsync(input, output);
}
