// @ts-check

import resolveImports from "./resolveImports.mjs";

/**
 * A cache for resolved imports.
 * @type {Map<string, Array<string>>}
 */
const cache = new Map();

/**
 * Resolves the imports for a given module and caches the result.
 * @param {string} module The path to the module.
 * @returns An array containing paths to modules that can be preloaded, or otherwise `undefined`.
 */
export default async function resolveImportsCached(module) {
  const paths = cache.get(module);

  if (paths !== undefined) {
    return paths;
  } else {
    const graph = await resolveImports(module);

    if (graph.length > 0) {
      cache.set(module, graph);
      return graph;
    }
  }
}
