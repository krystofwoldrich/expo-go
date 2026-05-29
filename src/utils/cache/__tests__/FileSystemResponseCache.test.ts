import { beforeEach, describe, expect, it, mock } from 'bun:test';
import crypto from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { fs, vol } from 'memfs';

import type { ResponseCacheEntry } from '../ResponseCache';

mock.module('node:fs', () => ({ default: fs, ...fs }));

const { FileSystemResponseCache } = await import('../FileSystemResponseCache');

describe('FileSystemResponseCache', () => {
  const cacheDirectory = join(tmpdir(), 'test-cache');
  let cache: InstanceType<typeof FileSystemResponseCache>;

  beforeEach(() => {
    vol.reset();
    cache = new FileSystemResponseCache({ cacheDirectory });
  });

  describe('get', () => {
    it('should return undefined when info file does not exist', async () => {
      const result = await cache.get('test-key');
      expect(result).toBeUndefined();
    });

    it('should return undefined when response has expired', async () => {
      const expiredInfo = {
        expiration: Date.now() - 1000,
        headers: {},
      };

      const paths = getTestFilePaths('test-key');
      await vol.promises.mkdir(cacheDirectory, { recursive: true });
      await vol.promises.writeFile(paths.info, JSON.stringify(expiredInfo));

      const result = await cache.get('test-key');

      expect(result).toBeUndefined();

      const files = await vol.promises.readdir(cacheDirectory);
      expect(files).toHaveLength(0);
    });

    it('should return cached response for empty body', async () => {
      const responseInfo = {
        empty: true,
        headers: { 'content-type': 'text/plain' },
      };

      const paths = getTestFilePaths('test-key');
      await vol.promises.mkdir(cacheDirectory, { recursive: true });
      await vol.promises.writeFile(paths.info, JSON.stringify(responseInfo));

      const result = await cache.get('test-key');

      expect(result).toBeDefined();
      expect(result?.info.headers).toEqual({ 'content-type': 'text/plain' });

      const reader = result!.body.getReader();
      let content = new Uint8Array();
      let isDone = false;

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          isDone = true;
          break;
        }
        if (value) {
          const newContent = new Uint8Array(content.length + value.length);
          newContent.set(content);
          newContent.set(value, content.length);
          content = newContent;
        }
      }

      expect(content.length).toBe(0);
      expect(isDone).toBeTruthy();
    });

    it('should return cached response with body', async () => {
      const bodyContent = 'Hello, World!';
      const responseInfo = {
        bodyPath: getTestFilePaths('test-key').body,
        headers: { 'content-type': 'text/plain' },
      };

      const paths = getTestFilePaths('test-key');
      await vol.promises.mkdir(cacheDirectory, { recursive: true });
      await vol.promises.writeFile(paths.info, JSON.stringify(responseInfo));
      await vol.promises.writeFile(paths.body, bodyContent);

      const result = await cache.get('test-key');

      expect(result).toBeDefined();
      expect(result?.info.headers).toEqual({ 'content-type': 'text/plain' });

      const reader = result!.body.getReader();
      const { value, done } = await reader.read();
      expect(new TextDecoder().decode(value)).toBe(bodyContent);
      expect(done).toBeFalsy();
    });
  });

  describe('set', () => {
    it('should create cache directory if it does not exist', async () => {
      const response = createTestResponse('test');

      await cache.set('test-key', response);

      const dirExists = await vol.promises
        .stat(cacheDirectory)
        .then(stats => stats.isDirectory())
        .catch(() => false);

      expect(dirExists).toBe(true);
    });

    it('should store empty response correctly', async () => {
      const response = createTestResponse('');

      await cache.set('test-key', response);

      const paths = getTestFilePaths('test-key');
      const storedInfo = JSON.parse(String(await fs.promises.readFile(paths.info, 'utf8')));

      expect(storedInfo).toMatchObject({
        empty: true,
        headers: response.info.headers,
      });

      await expect(vol.promises.access(paths.body)).rejects.toThrow();
    });

    it('should store response with TTL when configured', async () => {
      const ttlCache = new FileSystemResponseCache({ cacheDirectory, ttl: 3600000 });
      const response = createTestResponse('test');

      const beforeTime = Date.now();
      await ttlCache.set('test-key', response);
      const afterTime = Date.now();

      const paths = getTestFilePaths('test-key');
      const storedInfo = JSON.parse(String(await fs.promises.readFile(paths.info, 'utf8')));

      expect(storedInfo.expiration).toBeGreaterThanOrEqual(beforeTime + 3600000);
      expect(storedInfo.expiration).toBeLessThanOrEqual(afterTime + 3600000);
    });

    it('should handle stream tee and write correctly', async () => {
      const bodyContent = 'Hello, World!';
      const response = createTestResponse(bodyContent);

      await cache.set('test-key', response);

      const paths = getTestFilePaths('test-key');
      const storedBody = String(await vol.promises.readFile(paths.body, 'utf8'));
      const storedInfo = JSON.parse(String(await fs.promises.readFile(paths.info, 'utf8')));

      expect(storedBody).toBe(bodyContent);
      expect(storedInfo.headers).toEqual(response.info.headers);
      expect(storedInfo.bodyPath).toBe(paths.body);
    });
  });

  describe('remove', () => {
    it('should remove both info and body files', async () => {
      const paths = getTestFilePaths('test-key');
      await vol.promises.mkdir(cacheDirectory, { recursive: true });
      await vol.promises.writeFile(paths.info, '{}');
      await vol.promises.writeFile(paths.body, 'test');

      await cache.remove('test-key');

      const files = await vol.promises.readdir(cacheDirectory);
      expect(files).toHaveLength(0);
    });

    it('should not throw if files do not exist', async () => {
      await expect(cache.remove('test-key')).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in info file', async () => {
      const paths = getTestFilePaths('test-key');
      await vol.promises.mkdir(cacheDirectory, { recursive: true });
      await vol.promises.writeFile(paths.info, 'invalid json');

      const result = await cache.get('test-key');

      expect(result).toBeUndefined();
    });
  });
});

function getTestFilePaths(cacheKey: string) {
  const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  return {
    info: join(tmpdir(), 'test-cache', `${hash}-info.json`),
    body: join(tmpdir(), 'test-cache', `${hash}-body.bin`),
  };
}

function createTestResponse(content: string): ResponseCacheEntry {
  return {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(content));
        controller.close();
      },
    }),
    info: {
      status: 200,
      statusText: 'OK',
      url: 'http://localhost',
      headers: { 'content-type': 'text/plain' },
    },
  };
}
