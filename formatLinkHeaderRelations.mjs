// @ts-check

import formatLinkHeaderRelation from "./formatLinkHeaderRelation.mjs";

/**
 * Formats an array of resources as a Link header value.
 * @param {Array<string>} resources The resources to format.
 * @returns {string} The formatted Link header value.
 */
export default function formatLinkHeaderRelations(resources) {
  return resources.map(formatLinkHeaderRelation).join(", ");
}
