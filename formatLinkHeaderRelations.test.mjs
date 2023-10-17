// @ts-check

import test from "node:test";
import assert from "node:assert/strict";
import formatLinkHeaderRelations from "./formatLinkHeaderRelations.mjs";

test("formatLinkHeaderRelations", () => {
  assert.equal(
    formatLinkHeaderRelations(["/a.mjs", "/b.mjs", "/c.mjs"]),
    '</a.mjs>; rel="modulepreload", </b.mjs>; rel="modulepreload", </c.mjs>; rel="modulepreload"',
  );
});
