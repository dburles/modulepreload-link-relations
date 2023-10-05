import { parse } from "es-module-lexer";
import { readFile } from "fs/promises";
import path from "node:path";
import fs from "node:fs/promises";

async function exists(module) {
  try {
    await fs.access(module);
    return true;
  } catch (error) {
    return false;
  }
}

export default async function resolveImports(module, root = true) {
  const source = await readFile(module, "utf-8");

  const [imports] = await parse(source);

  let modules = [];

  await Promise.all(
    imports.map(async ({ n: specifier }) => {
      const resolvedModule = path.resolve(path.dirname(module), specifier);
      const preloadable = await exists(resolvedModule);

      if (preloadable) {
        if (!root) {
          modules.push(resolvedModule);
        }
        const graph = await resolveImports(resolvedModule, false);
        graph.forEach((module) => modules.push(module));
      }
    }),
  );

  return modules;
}
