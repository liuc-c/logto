import { createRequire } from 'node:module';

// eslint-disable-next-line @silverhand/fp/no-mutation -- the bundled browser dependencies need the same CommonJS bridge as the upstream API suite
globalThis.require = createRequire(import.meta.url);
