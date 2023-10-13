import { parse } from "es-module-lexer";
import path from "node:path";
import { readFile, access } from "node:fs/promises";

async function exists(module) {
  try {
    await access(module);
    return true;
  } catch (error) {
    return false;
  }
}

export default async function resolveImports(module, root = true) {
  let source;

  try {
    source = await readFile(module, "utf-8");
  } catch (error) {
    return;
  }

  const [imports] = await parse(source);

  let modules = [];

  await Promise.all(
    imports.map(async ({ n: specifier }) => {
      if (specifier) {
        const resolvedModule = path.resolve(path.dirname(module), specifier);
        const preloadable = await exists(resolvedModule);

        if (preloadable) {
          if (!root) {
            modules.push(resolvedModule);
          }

          const graph = await resolveImports(resolvedModule, false);

          if (graph) {
            graph.forEach((module) => modules.push(module));
          }
        }
      }
    }),
  );

  return modules;
}
