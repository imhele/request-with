import type { Method as HTTPMethod } from 'axios';
import { ParseOptions, TokensToFunctionOptions, compile } from 'path-to-regexp';
import type { RequestWithArgument, RequestWithArgumentTransformer, RequestWithPreset } from './by';

export interface RequestWithPayload {
  body?: unknown;
  headers?: t.UnknownRecord;
  method?: HTTPMethod;
  queries?: t.UnknownRecord;
  url?: string;
}

export type RequestWithPayloads = {
  [Key in keyof RequestWithPayload]-?: NonNullable<RequestWithPayload[Key]>[];
};

export function requestWithBody<Body>(): RequestWithArgument<'body', Body, [body: Body]> {
  return ['argument', 'body'];
}

export function requestWithHeaders<Headers extends t.AnyRecord>(): RequestWithArgument<
  'headers',
  Headers,
  [headers: Headers]
> {
  return ['argument', 'headers'];
}

export function requestWithPresetHeaders<Headers extends t.AnyRecord>(
  headers: Headers,
): RequestWithPreset<'headers'> {
  return ['preset', { headers }];
}

requestWithHeaders.preset = requestWithPresetHeaders;

export function requestWithMethod<Method extends HTTPMethod>(): RequestWithArgument<
  'method',
  Method,
  [method: Method]
> {
  return ['argument', 'method'];
}

export function requestWithPresetMethod<Method extends HTTPMethod>(
  method: Method,
): RequestWithPreset<'method'> {
  return ['preset', { method }];
}

requestWithMethod.preset = requestWithPresetMethod;

export function requestWithQueries<Queries extends t.AnyRecord>(): RequestWithArgument<
  'queries',
  Queries,
  [queries: Queries]
> {
  return ['argument', 'queries'];
}

export function requestWithPresetQueries<Queries extends t.AnyRecord>(
  queries: Queries,
): RequestWithPreset<'queries'> {
  return ['preset', { queries }];
}

requestWithQueries.preset = requestWithPresetQueries;

export function requestWithQuery<Query extends [any]>(
  key: string,
): RequestWithArgumentTransformer<Query[0], Query> {
  return [
    'argument-transformer',
    function queryTransformer(argument, payloads) {
      payloads.queries.push({ [key]: argument });
    },
  ];
}

type URLTemplateOptionalParam<
  T extends string,
  U = string | number | boolean
> = T extends `${infer Param}?` ? { [k in Param]?: U } : { [k in T]: U };

export type URLTemplateParams<
  Template extends string,
  Value = string | number | boolean
> = string extends Template
  ? { [k in string]?: Value }
  : Template extends `${string}:${infer Param}/${infer Rest}`
  ? URLTemplateOptionalParam<Param, Value> & URLTemplateParams<Rest, Value>
  : Template extends `${string}:${infer Param}`
  ? URLTemplateOptionalParam<Param, Value>
  : Record<never, never>;

export function requestWithTemplate<
  Template extends string,
  Params extends t.AnyRecord = URLTemplateParams<Template>
>(
  template: Template,
  options?: ParseOptions & TokensToFunctionOptions,
): RequestWithArgumentTransformer<Params, [params: Params]> {
  const compiled = compile(template, options);

  return [
    'argument-transformer',
    function templateTransformer(argument, payloads) {
      payloads.url.push(compiled(argument));
    },
  ];
}

export default {
  body: requestWithBody,
  headers: requestWithHeaders,
  method: requestWithMethod,
  queries: requestWithQueries,
  query: requestWithQuery,
  template: requestWithTemplate,
};
