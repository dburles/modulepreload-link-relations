// @ts-check

import formatLinkHeaderRelation from "./formatLinkHeaderRelation.mjs";

/**
 * Formats resources as a `Link` header value.
 * @param {Array<string>} resources Resources to format.
 * @returns The formatted `Link` header value.
 */
export default function formatLinkHeaderRelations(resources) {
  return resources.map(formatLinkHeaderRelation).join(", ");
}
