import path from "node:path";
import resolveImportsCached from "./resolveImportsCached.mjs";

export default async function resolveLinkRelations({ appPath, url }) {
  const rootPath = path.resolve(appPath);
  const resolvedFile = path.join(rootPath, url);

  if (resolvedFile.startsWith(rootPath)) {
    const modules = await resolveImportsCached(resolvedFile);

    if (modules?.length > 0) {
      const resolvedModules = modules.map((module) => {
        return "/" + path.relative(rootPath, module);
      });

      if (resolvedModules?.length > 0) {
        return resolvedModules;
      }
    }
  }
}
