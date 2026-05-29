import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import { extract } from 'tar';

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export async function downloadFileWithProgressTrackerAsync(
  url: string,
  outputPath: string,
  progressTrackerMessage: string | ((ratio: number, total: number) => string),
  progressTrackerCompletedMessage: string,
  { fetch: fetchInstance = fetch }: { showNewLine?: boolean; fetch?: FetchLike } = {}
): Promise<void> {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true });

    const response = await fetchInstance(url, {
      signal: AbortSignal.timeout(1000 * 60 * 5),
    });
    if (!response.ok) {
      throw new Error(`Failed to download file from ${url}`);
    }

    const total = Number(response.headers.get('content-length'));
    if (typeof progressTrackerMessage === 'function' && Number.isFinite(total) && total > 0) {
      progressTrackerMessage(1, total);
    } else if (typeof progressTrackerMessage === 'string') {
      void progressTrackerMessage;
    }
    void progressTrackerCompletedMessage;

    if (!response.body) {
      throw new Error(`Failed to download file from ${url}`);
    }

    await pipeline(
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(outputPath)
    );
  } catch (error) {
    await rm(outputPath, { force: true, recursive: true });
    throw error;
  }
}

export async function extractArchiveAsync(input: string, output: string): Promise<void> {
  try {
    if (await extractWithNativeTarAsync(input, output)) {
      return;
    }
  } catch {
    // Fall back to the JS implementation below.
  }

  await extract({ cwd: output, file: input });
}

function extractWithNativeTarAsync(input: string, output: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const subprocess = spawn('tar', ['-xf', input, '-C', output], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    subprocess.on('error', reject);
    subprocess.on('close', code => {
      resolve(code === 0);
    });
  });
}
