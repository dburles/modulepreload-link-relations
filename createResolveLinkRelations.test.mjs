// @ts-check

import test from "node:test";
import assert from "node:assert/strict";
import createResolveLinkRelations from "./createResolveLinkRelations.mjs";

test("createResolveLinkRelations", async (t) => {
  await t.test("works", async () => {
    const resolveLinkRelations = createResolveLinkRelations("test-fixtures");
    const resolvedModules = await resolveLinkRelations("/a.mjs");

    assert.ok(Array.isArray(resolvedModules));

    assert.ok(resolvedModules.includes("/c.mjs"));
    assert.ok(resolvedModules.includes("/d.mjs"));
    assert.ok(resolvedModules.includes("/lib/aa.mjs"));
    assert.ok(resolvedModules.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModules.includes("/lib/cc.mjs"));

    assert.equal(resolvedModules.length, 4);

    const resolvedModulesCached = await resolveLinkRelations("/a.mjs");

    assert.ok(Array.isArray(resolvedModulesCached));

    assert.ok(resolvedModulesCached.includes("/c.mjs"));
    assert.ok(resolvedModulesCached.includes("/d.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/aa.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModulesCached.includes("/lib/cc.mjs"));

    assert.equal(resolvedModulesCached.length, 4);
  });

  await t.test("can't reach outside of appPath", async () => {
    const resolveLinkRelations = createResolveLinkRelations("test-fixtures");
    const resolvedModules = await resolveLinkRelations("../../a.mjs");

    assert.equal(resolvedModules, undefined);
  });

  await t.test("module without imports", async () => {
    const resolveLinkRelations = createResolveLinkRelations("test-fixtures");
    const resolvedModules = await resolveLinkRelations("/d.mjs");

    assert.equal(resolvedModules, undefined);
  });

  await t.test("module doesn't exist", async () => {
    const resolveLinkRelations = createResolveLinkRelations("test-fixtures");
    const resolvedModules = await resolveLinkRelations("/does-not-exist.mjs");

    assert.equal(resolvedModules, undefined);
  });

  await t.test("resolve import maps", async (tt) => {
    await tt.test("basic", async () => {
      const resolveLinkRelations = createResolveLinkRelations("test-fixtures", {
        importMap: '{ "imports": { "g": "./g.mjs" } }',
      });
      const resolvedModules = await resolveLinkRelations("/e.mjs");

      assert.ok(Array.isArray(resolvedModules));

      assert.ok(resolvedModules.includes("/g.mjs"));
    });

    await tt.test("ignores external urls", async () => {
      const resolveLinkRelations = createResolveLinkRelations("test-fixtures", {
        importMap:
          '{ "imports": { "z": "/z.mjs", "foo": "https://foo.com/bar" } }',
      });
      const resolvedModules = await resolveLinkRelations("/x.mjs");

      assert.ok(Array.isArray(resolvedModules));

      assert.ok(resolvedModules.includes("/z.mjs"));
    });

    await tt.test("resolves root module", async () => {
      const resolveLinkRelations = createResolveLinkRelations("test-fixtures", {
        importMap: '{ "imports": { "e": "./e.mjs", "g": "./g.mjs" } }',
      });
      const resolvedModules = await resolveLinkRelations("e");

      assert.ok(Array.isArray(resolvedModules));

      assert.ok(resolvedModules.includes("/g.mjs"));
    });
  });

  await t.test("async cache", async () => {
    const cache = new Map();
    const asyncCache = {
      cache: new Map(),
      /** @param {any} key */
      async get(key) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        return cache.get(key);
      },
      /**
       * @param {any} key
       * @param {any} value
       */
      async set(key, value) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        cache.set(key, value);
      },
    };

    const resolveLinkRelations = createResolveLinkRelations("test-fixtures", {
      cache: asyncCache,
    });
    const resolvedModules = await resolveLinkRelations("/a.mjs");

    assert.ok(Array.isArray(resolvedModules));

    assert.ok(resolvedModules.includes("/c.mjs"));
    assert.ok(resolvedModules.includes("/d.mjs"));
    assert.ok(resolvedModules.includes("/lib/aa.mjs"));
    assert.ok(resolvedModules.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModules.includes("/lib/cc.mjs"));

    assert.equal(resolvedModules.length, 4);

    const resolvedModulesCached = await resolveLinkRelations("/a.mjs");

    assert.ok(Array.isArray(resolvedModulesCached));

    assert.ok(resolvedModulesCached.includes("/c.mjs"));
    assert.ok(resolvedModulesCached.includes("/d.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/aa.mjs"));
    assert.ok(resolvedModulesCached.includes("/lib/bb.mjs"));
    // Should not resolve dynamic imports
    assert.ok(!resolvedModulesCached.includes("/lib/cc.mjs"));

    assert.equal(resolvedModulesCached.length, 4);
  });
});
