import path from 'node:path';

import { FileSystemResponseCache } from './cache/FileSystemResponseCache';
import type { FetchLike, ProgressCallback } from './cache/ResponseCache';
import { wrapFetchWithCache } from './cache/wrapFetchWithCache';
import { wrapFetchWithProgress } from './cache/wrapFetchWithProgress';
import { env } from './env';
import { getExpoHomeDirectory } from './paths';

export type { FetchLike, ProgressCallback };

export function createFetch({
  fetch: fetchInstance = fetch as FetchLike,
  cacheDirectory,
  ttl,
  skipCache,
}: {
  fetch?: FetchLike;
  cacheDirectory: string;
  ttl?: number;
  skipCache?: boolean;
}): FetchLike {
  const fetchWithProgress = wrapFetchWithProgress(fetchInstance);

  if (skipCache || env.EXPO_BETA || env.EXPO_NO_CACHE) {
    return fetchWithProgress;
  }

  return wrapFetchWithCache(
    fetchWithProgress,
    new FileSystemResponseCache({
      cacheDirectory: path.join(getExpoHomeDirectory(), cacheDirectory),
      ttl,
    })
  );
}
