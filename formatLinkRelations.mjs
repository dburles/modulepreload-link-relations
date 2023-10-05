import formatLinkRelation from "./formatLinkRelation.mjs";

export default function formatLinkRelations(resources) {
  return resources.map(formatLinkRelation).join(", ");
}
