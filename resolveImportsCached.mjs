import resolveImports from "./resolveImports.mjs";

const cache = new Map();

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
