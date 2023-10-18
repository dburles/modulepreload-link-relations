import test from "node:test";
import assert from "node:assert/strict";
import resolveLinkRelations from "./resolveLinkRelations.mjs";

test("resolveLinkRelations", async (t) => {
  await t.test("works", async () => {
    const resolvedModules = await resolveLinkRelations({
      appPath: "test-fixtures",
      url: "/a.mjs",
    });

    assert.ok(resolvedModules.includes("/c.mjs"));
    assert.ok(resolvedModules.includes("/d.mjs"));
    assert.ok(resolvedModules.includes("/lib/aa.mjs"));
    assert.ok(resolvedModules.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModules.includes("/lib/cc.mjs"));

    assert.equal(resolvedModules.length, 4);

    const resolvedModulesCached = await resolveLinkRelations({
      appPath: "test-fixtures",
      url: "/a.mjs",
    });

    assert.ok(resolvedModulesCached.includes("/c.mjs"));
    assert.ok(resolvedModulesCached.includes("/d.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/aa.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModulesCached.includes("/lib/cc.mjs"));

    assert.equal(resolvedModulesCached.length, 4);
  });

  await t.test("can't reach outside of appPath", async () => {
    const resolvedModules = await resolveLinkRelations({
      appPath: "test-fixtures",
      url: "../../a.mjs",
    });

    assert.equal(resolvedModules, undefined);
  });

  await t.test("module without imports", async () => {
    const resolvedModules = await resolveLinkRelations({
      appPath: "test-fixtures",
      url: "/d.mjs",
    });

    assert.equal(resolvedModules, undefined);
  });

  await t.test("module doesn't exist", async () => {
    const resolvedModules = await resolveLinkRelations({
      appPath: "test-fixtures",
      url: "/does-not-exist.mjs",
    });

    assert.equal(resolvedModules, undefined);
  });
});
