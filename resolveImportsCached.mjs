// @ts-check

import resolveImports from "./resolveImports.mjs";

/** @typedef {import("./resolveImports.mjs").ResolvedImports} ResolvedImports */

const cache = new Map();

/**
 * Resolves the imports for a given module and caches the result.
 * @param {string} module The path to the module.
 * @returns {Promise<ResolvedImports>} The resolved modules.
 */
export default async function resolveImportsCached(module) {
  const paths = cache.get(module);

  if (paths) {
    return paths;
  } else {
    const graph = await resolveImports(module);

    if (graph?.length > 0) {
      cache.set(module, graph);
      return graph;
    }
  }
}
