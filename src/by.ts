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
  with<Argument, ArgumentWithName extends [Argument]>(
    config: RequestWithArgumentTransformer<Argument, ArgumentWithName>,
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
  Argument,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ArgumentWithName extends [Argument] = [Argument]
> = ['argument-transformer', (argument: Argument, payloads: RequestWithPayloads) => void];

export type RequestWithPreset<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument extends RequestWithPayload[Key] = RequestWithPayload[Key]
> = ['preset', RequestWithPayload | [Key, Argument]];

export type RequestWithTransformer = ['transformer', (payloads: RequestWithPayloads) => void];

export type RequestWith<
  Key extends keyof RequestWithPayload = keyof RequestWithPayload,
  Argument extends RequestWithPayload[Key] = RequestWithPayload[Key],
  ArgumentWithName extends [Argument] = [Argument],
  TransformerArgument = unknown,
  TransformerArgumentWithName extends [TransformerArgument] = [TransformerArgument]
> =
  | RequestWithArgument<Key, Argument, ArgumentWithName>
  | RequestWithArgumentTransformer<TransformerArgument, TransformerArgumentWithName>
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
  configs: RequestWith<keyof RequestWithPayload, any, [any], any, [any]>[] = [],
): Request<Argumnets, Response> {
  const request: Request<Argumnets, Response> = function request() {
    const context = configs.reduce(reduceRequestPayloads, {
      args: arguments[Symbol.iterator](),
      payloads: { body: [], headers: [], queries: [], method: [], url: [] },
    });
    return adapter(context.payloads);
  };

  request.with = requestWith as any;

  return request;

  function requestWith(arg: RequestWith<keyof RequestWithPayload, any, [any], any, [any]>) {
    return createRequestWith(adapter, configs.concat([arg]));
  }
}

interface RequestPayloadReduceContext {
  args: IterableIterator<any>;
  payloads: RequestWithPayloads;
}

const isKey = Object.prototype.hasOwnProperty as t.Object.prototype.hasOwnProperty;

function reduceRequestPayloads(
  context: RequestPayloadReduceContext,
  config: RequestWith<keyof RequestWithPayload, any, [any], any, [any]>,
): RequestPayloadReduceContext {
  const { args, payloads } = context;

  if (config[0] === 'argument') {
    payloads[config[1]].push(args.next().value);
  } else if (config[0] === 'argument-transformer') {
    config[1](args.next().value, payloads);
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
