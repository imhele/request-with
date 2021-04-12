import type { RequestWithArgument, RequestWithArgumentTransformer } from './by';
import { RequestWithPayload } from './with';

const isKey = Object.prototype.hasOwnProperty as t.Object.prototype.hasOwnProperty;

export function requestWithMix<Mix extends t.AnyRecord>(
  mix: {
    [Key in keyof Mix]:
      | RequestWithArgument<keyof RequestWithPayload, Mix[Key], [Mix[Key]]>
      | RequestWithArgumentTransformer<Mix[Key], [Mix[Key]]>;
  },
): RequestWithArgumentTransformer<Mix, [mix: Mix]> {
  return [
    'argument-transformer',
    function mixTransformer(argument, payloads) {
      for (const key in mix) {
        if (isKey.call(mix, key)) {
          const config = mix[key];
          if (config[0] === 'argument') {
            payloads[config[1] as keyof RequestWithPayload].push(argument[key]);
          } else if (config[0] === 'argument-transformer') {
            (config as RequestWithArgumentTransformer<unknown>)[1](mix[key], payloads);
          }
        }
      }
    },
  ];
}
