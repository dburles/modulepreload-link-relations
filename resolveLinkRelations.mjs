// @ts-check

import path from "node:path";
import resolveImportsCached from "./resolveImportsCached.mjs";

/**
 * Resolves link relations for a given URL.
 * @param {object} options Options.
 * @param {string} options.appPath The path to the application root from where files can be read.
 * @param {string} options.url The module URL to resolve.
 * @returns An array containing relative paths to modules that can be preloaded, or otherwise `undefined`.
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

      if (resolvedModules.length > 0) {
        return resolvedModules;
      }
    }
  }
}
