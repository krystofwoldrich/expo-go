import { Buffer } from 'node:buffer';

import type { FetchLike } from './ResponseCache';

export function wrapFetchWithProgress(fetch: FetchLike): FetchLike {
  return async function fetchWithProgress(url, init) {
    const response = await fetch(url, init);
    const onProgress = init?.onProgress;

    if (!onProgress || !response.ok || !response.body) {
      return response;
    }
    const reportProgress = onProgress;

    const progressTotal = Number(response.headers.get('content-length'));
    if (!progressTotal || Number.isNaN(progressTotal) || progressTotal < 0) {
      return response;
    }

    let progressCurrent = 0;
    const bodyReader = response.body.getReader();
    const bodyWithProgress = new ReadableStream({
      start(controller) {
        function next() {
          bodyReader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            progressCurrent += Buffer.byteLength(value);
            reportProgress({
              progress: progressCurrent / progressTotal || 0,
              total: progressTotal,
              loaded: progressCurrent,
            });

            controller.enqueue(value);
            next();
          });
        }

        next();
      },
    });

    return new Response(bodyWithProgress, response);
  };
}
