import formatLinkHeaderRelation from "./formatLinkHeaderRelation.mjs";

export default function formatLinkHeaderRelations(resources) {
  return resources.map(formatLinkHeaderRelation).join(", ");
}
