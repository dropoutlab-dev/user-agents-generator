/**
 * ESM entry point. The implementation lives in index.cjs so CJS and ESM users
 * load the same module instance: a dual-package hazard here would mean two
 * copies of the dataset in memory and two different caches of fallbacks.
 */
import api from './index.cjs';

export default api;
export const {
  chrome,
  firefox,
  safari,
  android,
  ios,
  edge,
  opera,
  random,
  generate,
  headers,
} = api;
