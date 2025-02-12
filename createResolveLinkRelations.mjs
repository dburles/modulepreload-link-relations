// @ts-check

import path from "node:path";
import { access, readFile } from "node:fs/promises";
import { parse } from "es-module-lexer";
import parseFromString from "./resolve-import-map/parseFromString.mjs";
import resolveImportMap from "./resolve-import-map/resolveImportMap.mjs";

/**
 * @typedef {object} AsyncMap
 * @property {(key: any) => Promise<any>} get A function that takes a key as an argument and returns a promise that resolves to a value.
 * @property {(key: any, value: any) => Promise<void>} set A function that takes a key and a value as arguments and returns a promise.
 */

/** @typedef {Map<any, any> | AsyncMap} AsyncMapLike */

/** @typedef {(specifier: string) => string} ResolveSpecifier */

// The import map parser requries a base url. We don't require one for our purposes,
// but it allows us to use the parser without modifying the source. One quirk is that it will try map
// this url to files locally if it's specified, but no one should do that.
const DUMMY_HOSTNAME = "example.com";

/**
 * Reads a file if possible.
 * @param {string} filePath The path to the file.
 * @returns The file contents, or otherwise `undefined`.
 */
async function tryReadFile(filePath) {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    // Do nothing.
  }
}

/**
 * Checks if a file exists.
 * @param {string} filePath The path to the file.
 * @returns Does the file exist.
 */
async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Takes a specifier and resolves through an import map.
 * @param {string} specifier Import specifier.
 * @param {object} options Options.
 * @param {string} options.url The module URL to resolve.
 * @param {object} [options.parsedImportMap] A parsed import map.
 * @param {ResolveSpecifier} [options.resolveSpecifierOverride] Override specifier resolution.
 */
function resolveSpecifier(
  specifier,
  { url, parsedImportMap, resolveSpecifierOverride = (x) => x },
) {
  // If an import map is supplied, everything resolves through it.
  if (parsedImportMap) {
    const importMapResolved = resolveImportMap(
      specifier,
      parsedImportMap,
      new URL(url, `https://${DUMMY_HOSTNAME}`),
    );

    if (importMapResolved.hostname === DUMMY_HOSTNAME) {
      // It will match if it's a local module.
      return {
        importMap: true,
        importMapResolved,
        specifier: resolveSpecifierOverride(importMapResolved.pathname),
      };
    }
  }

  return {
    importMap: false,
    specifier: resolveSpecifierOverride(specifier),
  };
}

/**
 * Recursively parses and resolves a module's imports.
 * @param {string} module The path to the module.
 * @param {object} options Options.
 * @param {string} options.url The module URL to resolve.
 * @param {object} [options.parsedImportMap] A parsed import map.
 * @param {ResolveSpecifier} [options.resolveSpecifierOverride] Override specifier resolution.
 * @param {string} options.rootPath The absolute path to the specified application root.
 * @param {boolean} [root] Whether the module is the root module.
 * @returns {Promise<Set<string>>} A `Set` containing paths to modules that can be preloaded, or otherwise `undefined`.
 */
async function resolveImports(
  module,
  { url, parsedImportMap, resolveSpecifierOverride, rootPath },
  root = true,
  visited = new Set(),
) {
  /** @type {Set<string>} */
  const modules = new Set();

  if (visited.has(module)) {
    return modules;
  }

  visited.add(module);

  const source = await tryReadFile(module);

  if (source === undefined) {
    return modules;
  }

  const [imports] = parse(source);

  await Promise.all(
    imports.map(async ({ n: specifier, d }) => {
      const dynamic = d > -1;
      if (specifier && !dynamic) {
        const resolvedSpecifier = resolveSpecifier(specifier, {
          url,
          parsedImportMap,
          resolveSpecifierOverride,
        });
        const resolvedModule = path.join(
          resolvedSpecifier.importMap ? rootPath : path.dirname(module),
          resolvedSpecifier.specifier,
        );

        // If the module has resolved to a local file (and it exists), then it's preloadable.
        if (
          resolvedModule &&
          resolvedModule.startsWith(rootPath) &&
          (await exists(resolvedModule))
        ) {
          if (!root) {
            modules.add(resolvedModule);
          }

          const graph = await resolveImports(
            resolvedModule,
            {
              parsedImportMap,
              url: resolvedSpecifier.importMapResolved?.pathname || url,
              resolveSpecifierOverride,
              rootPath,
            },
            false,
            visited,
          );

          if (graph.size > 0) {
            graph.forEach((module) => modules.add(module));
          }
        }
      }
    }),
  );

  return modules;
}

/**
 * Resolves the imports for a given module and caches the result.
 * @param {string} module The path to the module.
 * @param {object} options Options.
 * @param {AsyncMapLike} options.cache Resolved imports cache.
 * @param {string} options.url The module URL to resolve.
 * @param {object} [options.parsedImportMap] A parsed import map.
 * @param {ResolveSpecifier} [options.resolveSpecifierOverride] Override specifier resolution.
 * @param {string} options.rootPath The absolute path to the specified application root.
 * @returns {Promise<Set<string> | undefined>} A `Set` containing paths to modules that can be preloaded, or otherwise `undefined`.
 */
async function resolveImportsCached(
  module,
  { cache, url, parsedImportMap, resolveSpecifierOverride, rootPath },
) {
  const paths = await cache.get(module);

  if (paths) {
    return paths;
  } else {
    const graph = await resolveImports(module, {
      parsedImportMap,
      url,
      resolveSpecifierOverride,
      rootPath,
    });

    if (graph.size > 0) {
      await cache.set(module, graph);
      return graph;
    }
  }
}

/**
 * Creates a function that resolves the link relations for a given module URL.
 * @param {string} appPath Path to the application root from where files can be read.
 * @param {object} [options] Options.
 * @param {string} [options.importMap] An import map.
 * @param {AsyncMapLike} [options.cache] Specify a cache for resolved imports.
 * @returns A function that resolves the link relations for a given module URL.
 */
export default function createResolveLinkRelations(
  appPath,
  { importMap: importMapString, cache = new Map() } = {},
) {
  /** @type {object} */
  let parsedImportMap;

  if (importMapString !== undefined) {
    parsedImportMap = parseFromString(
      importMapString,
      `https://${DUMMY_HOSTNAME}`,
    );
  }

  /**
   * Resolves link relations for a given URL.
   * @param {string} url The module URL to resolve.
   * @param {object} [options] Options.
   * @param {ResolveSpecifier} [options.resolveSpecifier] Override specifier resolution.
   * @returns {Promise<Array<string> | undefined>} An array containing relative paths to modules that can be preloaded, or otherwise `undefined`.
   */
  return async function resolveLinkRelations(
    url,
    { resolveSpecifier: resolveSpecifierOverride } = {},
  ) {
    const rootPath = path.resolve(appPath);
    const resolvedSpecifier = resolveSpecifier(url, {
      url,
      parsedImportMap,
      resolveSpecifierOverride,
    });
    const resolvedModule = path.join(rootPath, resolvedSpecifier.specifier);

    if (resolvedModule.startsWith(rootPath)) {
      const modules = await resolveImportsCached(resolvedModule, {
        cache,
        url,
        parsedImportMap,
        resolveSpecifierOverride,
        rootPath,
      });

      if (modules && modules.size > 0) {
        const resolvedModules = Array.from(modules).map((module) => {
          return "/" + path.relative(rootPath, module);
        });

        if (resolvedModules.length > 0) {
          return resolvedModules;
        }
      }
    }
  };
}
