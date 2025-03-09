import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const useApi = <T>() => {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const fetchApi = useCallback(
    async (
      url: string,
      method: HttpMethod,
      body?: Record<string, any>,
      customHeaders?: Record<string, string>
    ): Promise<ApiResponse<T>> => {
      setState((prevState) => ({ ...prevState, isLoading: true }));

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...customHeaders,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setState({ data, error: null, isLoading: false });
        return { data, error: null, isLoading: false };
      } catch (error) {
        const errorObj =
          error instanceof Error
            ? error
            : new Error('An unknown error occurred');
        setState({ data: null, error: errorObj, isLoading: false });
        return { data: null, error: errorObj, isLoading: false };
      }
    },
    []
  );

  const get = useCallback(
    (url: string, headers?: Record<string, string>) =>
      fetchApi(url, 'GET', undefined, headers),
    [fetchApi]
  );

  const post = useCallback(
    (
      url: string,
      body: Record<string, any>,
      headers?: Record<string, string>
    ) => fetchApi(url, 'POST', body, headers),
    [fetchApi]
  );

  const put = useCallback(
    (
      url: string,
      body: Record<string, any>,
      headers?: Record<string, string>
    ) => fetchApi(url, 'PUT', body, headers),
    [fetchApi]
  );

  const del = useCallback(
    (url: string, headers?: Record<string, string>) =>
      fetchApi(url, 'DELETE', undefined, headers),
    [fetchApi]
  );

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi;
