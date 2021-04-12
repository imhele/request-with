import type { RequestWithAdapter } from './adapters';
import type { RequestWithPayload, RequestWithPayloads } from './with';

export interface Request<Argumnets extends any[], Response> {
  (...args: Argumnets): Response;
  with<
    Key extends keyof RequestWithPayload,
    Argument extends RequestWithPayload[Key],
    ArgumentWithName extends [Argument]
  >(
    config: RequestWithArgument<Key, Argument, ArgumentWithName>,
  ): Request<[...Argumnets, ...ArgumentWithName], Response>;
  with<Key extends keyof RequestWithPayload, Argument, ArgumentWithName extends [Argument]>(
    config: RequestWithArgumentTransformer<Key, Argument, ArgumentWithName>,
  ): Request<[...Argumnets, ...ArgumentWithName], Response>;
  with<Key extends keyof RequestWithPayload, Argument extends RequestWithPayload[Key]>(
    config: RequestWithPreset<Key, Argument>,
  ): Request<Argumnets, Response>;
  with(config: RequestWithTransformer): Request<Argumnets, Response>;
}

export type RequestWithArgument<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument extends RequestWithPayload[Key] = RequestWithPayload[Key],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ArgumentWithName extends [Argument] = [Argument]
> = ['argument', Key];

export type RequestWithArgumentTransformer<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument = RequestWithPayload[Key],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ArgumentWithName extends [Argument] = [Argument]
> = [
  'argument-transformer',
  {
    key: Key;
    transform(argument: Argument, upstream: RequestWithPayloads): RequestWithPayload[Key];
  },
];

export type RequestWithPreset<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument extends RequestWithPayload[Key] = RequestWithPayload[Key]
> = ['preset', RequestWithPayload | [Key, Argument]];

export type RequestWithTransformer = ['transformer', (payloads: RequestWithPayloads) => void];

export type RequestWith<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument extends RequestWithPayload[Key] = RequestWithPayload[Key],
  ArgumentWithName extends [Argument] = [Argument]
> =
  | RequestWithArgument<Key, Argument, ArgumentWithName>
  | RequestWithArgumentTransformer<Key, Argument, ArgumentWithName>
  | RequestWithPreset<Key, Argument>
  | RequestWithTransformer;

export function requestBy(adapter: RequestWithAdapter<any>) {
  return function url<Response>(url?: string): Request<[], Response> {
    const request = createRequestWith<[], Response>(adapter);
    return url === undefined ? request : request.with(['preset', { url }]);
  };
}

function createRequestWith<Argumnets extends any[], Response>(
  adapter: RequestWithAdapter<any>,
  configs: RequestWith<keyof RequestWithPayload, any, [any]>[] = [],
): Request<Argumnets, Response> {
  const request: Request<Argumnets, Response> = function request() {
    const context = configs.reduce(reduceRequestPayloads, {
      args: arguments,
      payloads: {
        body: [],
        headers: [],
        params: [],
        queries: [],
        method: [],
        template: [],
        url: [],
      },
    });
    return adapter(context.payloads);
  };

  request.with = requestWith as any;

  return request;

  function requestWith(arg: RequestWith<keyof RequestWithPayload, any, [any]>) {
    return createRequestWith(adapter, configs.concat(arg));
  }
}

interface RequestPayloadReduceContext {
  args: IArguments;
  payloads: RequestWithPayloads;
}

const isKey = Object.prototype.hasOwnProperty as t.Object.prototype.hasOwnProperty;

function reduceRequestPayloads(
  context: RequestPayloadReduceContext,
  config: RequestWith<keyof RequestWithPayload>,
  index: number,
): RequestPayloadReduceContext {
  const { args, payloads } = context;

  if (config[0] === 'argument') {
    payloads[config[1]].push(args[index]);
  } else if (config[0] === 'argument-transformer') {
    payloads[config[1].key].push(config[1].transform(args[index], payloads) as never);
  } else if (config[0] === 'preset') {
    const payload = config[1];

    if (Array.isArray(payload)) {
      payloads[payload[0]].push(payload[1] as never);
    } else {
      for (const key in payload) {
        if (isKey.call(payload, key)) payloads[key].push(payload[key] as never);
      }
    }
  } else {
    config[1](payloads);
  }

  return context;
}
