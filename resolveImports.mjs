// @ts-check

import { parse } from "es-module-lexer";
import path from "node:path";
import { readFile, access } from "node:fs/promises";

/**
 * Checks if a file exists.
 * @param {string} filePath The path to the file.
 * @returns Does the file exist.
 */
async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Recursively parses and resolves a module's imports.
 * @param {string} module The path to the module.
 * @param {boolean} [root] Whether the module is the root module.
 * @returns An array containing paths to modules that can be preloaded.
 */
export default async function resolveImports(module, root = true) {
  /** @type {Array<string>} */
  let modules = [];

  /** @type {string | undefined} */
  let source;

  try {
    source = await readFile(module, "utf-8");
  } catch (error) {
    return modules;
  }

  const [imports] = await parse(source);

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

          if (graph.length > 0) {
            graph.forEach((module) => modules.push(module));
          }
        }
      }
    }),
  );

  return modules;
}
