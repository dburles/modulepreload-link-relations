// @ts-check

/**
 * Formats a resource as a `Link` header relation.
 * @param {string} resource The resource.
 * @returns The formatted `Link` header relation.
 */
export default function formatLinkHeaderRelation(resource) {
  return `<${resource}>; rel="modulepreload"`;
}
