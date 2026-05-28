import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

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

    await Bun.write(outputPath, response);
  } catch (error) {
    await rm(outputPath, { force: true, recursive: true });
    throw error;
  }
}

export async function extractArchiveAsync(input: string, output: string): Promise<void> {
  try {
    const subprocess = Bun.spawn(['tar', '-xf', input, '-C', output], {
      stderr: 'inherit',
      stdout: 'inherit',
    });
    const exitCode = await subprocess.exited;
    if (exitCode === 0) {
      return;
    }
  } catch {
    // Fall back to the JS implementation below.
  }

  await extract({ cwd: output, file: input });
}
