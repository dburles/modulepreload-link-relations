import test from "node:test";
import assert from "node:assert/strict";
import formatLinkHeaderRelation from "./formatLinkHeaderRelation.mjs";

test("formatLinkHeaderRelation", () => {
  const module = "/my-module.mjs";
  assert.equal(
    formatLinkHeaderRelation(module),
    `<${module}>; rel="modulepreload"`,
  );
});
