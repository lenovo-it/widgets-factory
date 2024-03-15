import { DefaultInvokeFetchTimeout, type FetchParameters, type InvokeFetchOptions } from '../types';

function validateFetchResStatus(status: Response['status']) {
  return status >= 200 && status < 300; // default
}

export function fetchWithTimeout(input: FetchParameters[0], init: FetchParameters[1], options?: InvokeFetchOptions) {
  const innerOptions = Object.assign(
    {
      timeout: DefaultInvokeFetchTimeout,
    },
    options,
  );

  const timeout = innerOptions?.timeout;
  if (typeof AbortController === 'function' && typeof timeout === 'number' && !Number.isNaN(timeout)) {
    const abortController = new AbortController();
    const tId = setTimeout(function () {
      abortController.abort(`Request timeout, exceed the maximum ${timeout}ms.`);
    }, timeout);

    return fetch(input, {
      signal: abortController.signal,
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    } as typeof init).finally(function () {
      clearTimeout(tId);
    });
  }

  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export function invokeFetch<T extends any>(...params: Parameters<typeof fetchWithTimeout>) {
  return fetchWithTimeout(...params).then(function (response) {
    return response
      .json()
      .catch<Promise<{ response: Response; data: null }>>(function (error) {
        const message = error instanceof Error ? error.message || 'Unknown issue occurred.' : 'Unknown issue occurred.';

        const newError = new Error(message);

        Object.assign(newError, {
          response,
          data: null,
        });

        throw newError;
      })
      .then(function (data: T | null) {
        if (!validateFetchResStatus(response.status)) {
          const error = new Error(response.statusText);

          Object.assign(error, {
            response,
            data,
          });

          throw error;
        }

        return {
          response,
          data,
        };
      });
  });
}
