import tryURLParse from "./tryURLParse.mjs";

export default function tryURLLikeSpecifierParse(specifier, baseURL) {
  if (
    specifier.startsWith("/") ||
    specifier.startsWith("./") ||
    specifier.startsWith("../")
  ) {
    return tryURLParse(specifier, baseURL);
  }

  const url = tryURLParse(specifier);

  return url;
}
