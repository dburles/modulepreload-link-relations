// @ts-check

import path from "node:path";
import resolveImportsCached from "./resolveImportsCached.mjs";

/** @typedef {import("./resolveImports.mjs").ResolvedImports} ResolvedImports */

/**
 * Resolves link relations for a given URL within an `appPath`.
 * @param {object} options Options.
 * @param {string} options.appPath The path to the app.
 * @param {string} options.url The module URL to resolve.
 * @returns {Promise<ResolvedImports>} The resolved modules.
 */
export default async function resolveLinkRelations({ appPath, url }) {
  const rootPath = path.resolve(appPath);
  const resolvedFile = path.join(rootPath, url);

  if (resolvedFile.startsWith(rootPath)) {
    const modules = await resolveImportsCached(resolvedFile);

    if (Array.isArray(modules) && modules.length > 0) {
      const resolvedModules = modules.map((module) => {
        return "/" + path.relative(rootPath, module);
      });

      if (resolvedModules?.length > 0) {
        return resolvedModules;
      }
    }
  }
}
