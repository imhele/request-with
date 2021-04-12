import { adapters } from './adapters';
import { requestBy } from './by';
import { requestWithMix } from './mix';
import requestWith from './with';

export * from './adapters';
export * from './with';

export default { ...requestWith, adapter: adapters, by: requestBy, mix: requestWithMix };
