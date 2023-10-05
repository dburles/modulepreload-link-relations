import path from "node:path";
import formatLinkRelations from "./formatLinkRelations.mjs";
import resolveImportsCached from "./resolveImportsCached.mjs";

export default async function resolveLinkRelations({
  appPath,
  url,
  extensions = ["js", "mjs"],
}) {
  const rootPath = path.resolve(appPath);
  const file = url.slice(1);
  const fileExt = path.extname(file).slice(1);

  if (fileExt && extensions.includes(fileExt)) {
    const resolvedFile = path.resolve(rootPath, file);

    if (resolvedFile.startsWith(rootPath)) {
      const modules = await resolveImportsCached(resolvedFile);

      if (modules?.length > 0) {
        const resolvedModules = modules.map((module) => {
          return "/" + path.relative(rootPath, module);
        });

        if (resolvedModules?.length > 0) {
          return formatLinkRelations(resolvedModules);
        }
      }
    }
  }
}
