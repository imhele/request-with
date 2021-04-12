import type { AxiosInstance, AxiosResponse } from 'axios';
import type { RequestWithPayloads } from './with';

export interface RequestWithAdapter<T> {
  (payloads: RequestWithPayloads): T;
}

export function requestWithAxiosAdapter(
  instance: AxiosInstance,
): RequestWithAdapter<Promise<AxiosResponse>> {
  return function axios(payloads) {
    const body = mix(payloads.body);
    const headers = mix(payloads.headers);
    const method = last(payloads.method);
    const queries = mix(payloads.queries);
    const url =
      last(payloads.url) ?? last(payloads.template)?.(mix(payloads.params) as never) ?? '';
    return instance.request({ data: body, headers, method, params: queries, url });
  };
}

export const adapters = { axios: requestWithAxiosAdapter } as const;

function last<T>(array: T[] | readonly T[]): T | undefined {
  return array.length ? array[array.length - 1] : undefined;
}

function mix(sources: unknown[]): unknown | undefined {
  return sources.reduce((mixed, source) => {
    if (typeof source === 'object' || typeof source === 'undefined') {
      return Object.assign(typeof mixed === 'object' && mixed !== null ? mixed : {}, source);
    }
    return source;
  }, undefined);
}
