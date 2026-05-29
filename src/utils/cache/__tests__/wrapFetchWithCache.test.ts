import { beforeEach, expect, it, mock } from 'bun:test';

import { fs, vol } from 'memfs';

import type { FetchLike } from '../ResponseCache';

mock.module('node:fs', () => ({ default: fs, ...fs }));

const { FileSystemResponseCache } = await import('../FileSystemResponseCache');
const { wrapFetchWithCache } = await import('../wrapFetchWithCache');

let fetch: ReturnType<typeof mock<FetchLike>>;
let fetchWithCache: FetchLike;

beforeEach(() => {
  vol.fromJSON({ '/test/.gitkeep': '' });
  fetch = mock<FetchLike>(async (url, init) => {
    const pathname = getPathname(url);
    if (pathname === '/get') {
      return jsonResponse({ get: true });
    }
    if (pathname === '/post') {
      return jsonResponse({ post: getPostResponseKind(init?.body) }, { status: 201 });
    }
    if (pathname === '/error/get') {
      return jsonResponse({ error: 'not found' }, { status: 404 });
    }

    throw new Error(`Unexpected request: ${String(url)}`);
  });
  fetchWithCache = wrapFetchWithCache(fetch, new FileSystemResponseCache({ cacheDirectory: '/test' }));
});

it('returns cached response for get request', async () => {
  async function fetchAction() {
    return await fetchWithCache('http://expo.test/get').then(res => res.json());
  }

  const response = await fetchAction();
  const cachedResponse = await fetchAction();

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(response).toEqual({ get: true });
  expect(response).toEqual(cachedResponse);
});

it('returns cached response for post request with json body', async () => {
  async function fetchAction() {
    return await fetchWithCache('http://expo.test/post', {
      method: 'POST',
      body: JSON.stringify({ test: 'json-body' }),
    }).then(response => response.json());
  }

  const response = await fetchAction();
  const cachedResponse = await fetchAction();

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(response).toEqual({ post: 'json-body' });
  expect(response).toEqual(cachedResponse);
});

it('returns cached response for post request formdata body', async () => {
  async function fetchAction() {
    const body = new FormData();
    body.append('test', 'formdata-body');

    return await fetchWithCache('http://expo.test/post', { body, method: 'POST' }).then(response =>
      response.json()
    );
  }

  const response = await fetchAction();
  const cachedResponse = await fetchAction();

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(response).toEqual({ post: 'formdata-body' });
  expect(response).toEqual(cachedResponse);
});

it('does not cache failed response for get request', async () => {
  async function fetchAction() {
    return await fetchWithCache('http://expo.test/error/get').then(res => res.json());
  }

  const response = await fetchAction();
  const cachedResponse = await fetchAction();

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(response).toEqual({ error: 'not found' });
  expect(response).toEqual(cachedResponse);
});

function getPathname(url: Parameters<FetchLike>[0]): string {
  if (typeof url === 'string') {
    return new URL(url).pathname;
  }
  if (url instanceof URL) {
    return url.pathname;
  }
  return new URL(url.url).pathname;
}

function getPostResponseKind(body: RequestInit['body']): string {
  if (typeof body === 'string') {
    return JSON.parse(body).test;
  }
  if (body?.toString() === '[object FormData]') {
    return new URLSearchParams(body as any).get('test') ?? '';
  }
  return '';
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });
}
