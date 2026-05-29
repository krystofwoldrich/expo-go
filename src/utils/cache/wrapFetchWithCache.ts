import Log from '../../log';
import {
  getRequestCacheKey,
  getResponseInfo,
  type FetchLike,
  type ResponseCache,
} from './ResponseCache';

// Copied from @expo/cli:
// https://github.com/expo/expo/blob/2c21e2f96ce6aede3d6bb5c780f0964d2116d37b/packages/@expo/cli/src/api/rest/cache/wrapFetchWithCache.ts#L8-L76
export function wrapFetchWithCache(fetch: FetchLike, cache: ResponseCache): FetchLike {
  return async function fetchWithCache(url, init) {
    const cacheKey = getRequestCacheKey(url, init);
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      return new Response(cachedResponse.body, cachedResponse.info);
    }

    await lock(cacheKey);

    try {
      let cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        return new Response(cachedResponse.body, cachedResponse.info);
      }

      const response = await fetch(url, init);
      if (!response.ok || !response.body) {
        return response;
      }

      cachedResponse = await cache.set(cacheKey, {
        body: response.body,
        info: getResponseInfo(response),
      });

      if (!cachedResponse) {
        Log.debug(`Failed to cache response for: ${url}`);
        await cache.remove(cacheKey);
        return response;
      }

      return new Response(cachedResponse.body, cachedResponse.info);
    } finally {
      unlock(cacheKey);
    }
  };
}

const lockPromiseForKey: Record<string, Promise<any>> = {};
const unlockFunctionForKey: Record<string, any> = {};

async function lock(key: string) {
  if (!lockPromiseForKey[key]) {
    lockPromiseForKey[key] = Promise.resolve();
  }

  const takeLockPromise = lockPromiseForKey[key];
  lockPromiseForKey[key] = takeLockPromise.then(
    () =>
      new Promise(fulfill => {
        unlockFunctionForKey[key] = fulfill;
      })
  );

  return takeLockPromise;
}

function unlock(key: string) {
  if (unlockFunctionForKey[key]) {
    unlockFunctionForKey[key]();
    delete unlockFunctionForKey[key];
  }
}
