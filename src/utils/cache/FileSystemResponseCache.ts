import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import stream, { Readable } from 'node:stream';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import type { ResponseCache, ResponseCacheEntry } from './ResponseCache';

type FileSystemResponseCacheInfo = ResponseCacheEntry['info'] & {
  /** The path to the cached body file */
  bodyPath?: string;
  /** If there is no response body */
  empty?: boolean;
  /** The expiration time, in milliseconds, when the response should be invalidated */
  expiration?: number;
};

// Copied from @expo/cli:
// https://github.com/expo/expo/blob/2c21e2f96ce6aede3d6bb5c780f0964d2116d37b/packages/@expo/cli/src/api/rest/cache/FileSystemResponseCache.ts#L19-L142
export class FileSystemResponseCache implements ResponseCache {
  /** The absolute path to the directory used to store responses */
  private cacheDirectory: string;
  /** Optional auto-expiration for all stored responses */
  private timeToLive?: number;

  constructor(options: { cacheDirectory: string; ttl?: number }) {
    this.cacheDirectory = options.cacheDirectory;
    this.timeToLive = options.ttl;
  }

  private getFilePaths(cacheKey: string) {
    // Create a hash of the cache key to use as filename.
    const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
    return {
      info: path.join(this.cacheDirectory, `${hash}-info.json`),
      body: path.join(this.cacheDirectory, `${hash}-body.bin`),
    };
  }

  /** Retrieve the cache response, if any */
  async get(cacheKey: string): Promise<ResponseCacheEntry | undefined> {
    const paths = this.getFilePaths(cacheKey);

    if (!(await fileExistsAsync(paths.info))) {
      return undefined;
    }

    const infoBuffer = await fs.promises.readFile(paths.info);

    try {
      const responseInfo: FileSystemResponseCacheInfo = JSON.parse(infoBuffer.toString());

      if (responseInfo.expiration && responseInfo.expiration < Date.now()) {
        await this.remove(cacheKey);
        return undefined;
      }

      const { empty, expiration, bodyPath, ...cleanInfo } = responseInfo;

      let responseBody: ReadableStream;
      if (empty) {
        responseBody = Readable.toWeb(Readable.from(Buffer.alloc(0))) as ReadableStream;
      } else {
        const bodyBuffer = await fs.promises.readFile(paths.body);
        responseBody = Readable.toWeb(Readable.from(bodyBuffer)) as ReadableStream;
      }

      return {
        body: responseBody,
        info: cleanInfo,
      };
    } catch {
      return undefined;
    }
  }

  /** Store the response for caching */
  async set(
    cacheKey: string,
    response: ResponseCacheEntry
  ): Promise<ResponseCacheEntry | undefined> {
    await fs.promises.mkdir(this.cacheDirectory, { recursive: true });
    const paths = this.getFilePaths(cacheKey);

    const responseInfo: FileSystemResponseCacheInfo = { ...response.info };

    if (typeof this.timeToLive === 'number') {
      responseInfo.expiration = Date.now() + this.timeToLive;
    }

    try {
      const [forSize, forWrite] = response.body.tee();

      const reader = forSize.getReader();
      const { value } = await reader.read();
      reader.releaseLock();

      if (!value || value.length === 0) {
        responseInfo.empty = true;
      } else {
        const writeStream = fs.createWriteStream(paths.body);
        const nodeStream = Readable.fromWeb(forWrite as NodeReadableStream);
        nodeStream.pipe(writeStream);

        await stream.promises.finished(writeStream);

        responseInfo.bodyPath = paths.body;
      }

      await fs.promises.writeFile(paths.info, JSON.stringify(responseInfo));

      return await this.get(cacheKey);
    } catch (error) {
      await this.remove(cacheKey);
      throw error;
    }
  }

  /** Remove the response from caching */
  async remove(cacheKey: string): Promise<void> {
    const paths = this.getFilePaths(cacheKey);
    await removeAllAsync(paths.info, paths.body);
  }
}

async function fileExistsAsync(filePath: string): Promise<boolean> {
  try {
    await fs.promises.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function removeAllAsync(...paths: string[]) {
  return Promise.all(
    paths.map(filePath =>
      fs.promises.rm(filePath, { recursive: true, force: true }).catch(() => {})
    )
  );
}
