// @ts-check

import { parse } from "es-module-lexer";
import path from "node:path";
import { readFile, access } from "node:fs/promises";

/**
 * Resolved imports.
 * @typedef {string[] | undefined} ResolvedImports
 */

/**
 * Checks if a file exists.
 * @param {string} module The path to the file.
 * @returns {Promise<boolean>} Whether the file exists.
 */
async function exists(module) {
  try {
    await access(module);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Recursively parses and resolves a module's imports.
 * @param {string} module The path to the module.
 * @param {boolean} [root=true] Whether the module is the root module.
 * @returns {Promise<ResolvedImports>} The resolved modules.
 */
export default async function resolveImports(module, root = true) {
  let source = "";

  try {
    source = await readFile(module, "utf-8");
  } catch (error) {
    return;
  }

  const [imports] = await parse(source);

  /** @type {Array<string>} */
  let modules = [];

  await Promise.all(
    imports.map(async ({ n: specifier, d }) => {
      const dynamic = d > -1;
      if (specifier && !dynamic) {
        const resolvedModule = path.resolve(path.dirname(module), specifier);
        const preloadable = await exists(resolvedModule);

        if (preloadable) {
          if (!root) {
            modules.push(resolvedModule);
          }

          const graph = await resolveImports(resolvedModule, false);

          if (graph?.length > 0) {
            graph.forEach((module) => modules.push(module));
          }
        }
      }
    }),
  );

  return modules;
}
