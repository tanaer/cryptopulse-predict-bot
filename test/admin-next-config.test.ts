import { test } from "node:test";
import assert from "node:assert/strict";

import nextConfig from "../apps/admin/next.config";

test("admin next.config: watchOptions.ignored 包含系统目录忽略项", () => {
  assert.equal(typeof nextConfig.webpack, "function");

  const config: any = { watchOptions: {} };
  const out = nextConfig.webpack?.(config);
  assert.ok(out?.watchOptions?.ignored);

  const ignored = out.watchOptions.ignored;
  const list = Array.isArray(ignored) ? ignored : [ignored];
  const joined = list.join(" ");
  assert.ok(joined.includes("System Volume Information"));
  assert.ok(joined.includes("$RECYCLE.BIN"));
});

