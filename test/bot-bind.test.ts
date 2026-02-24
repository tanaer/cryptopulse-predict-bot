import { test } from "node:test";
import assert from "node:assert/strict";

import { createBindCode, formatExpiresIn } from "../apps/bot/src/bind";

test("bot: formatExpiresIn 缺省值可读", () => {
  assert.ok(formatExpiresIn().includes("有效期"));
});

test("bot: createBindCode 失败时抛出包含状态码的错误", async () => {
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response("nope", { status: 500 })) as any;
  try {
    await assert.rejects(
      () =>
        createBindCode({
          apiBaseUrl: "http://localhost:3000",
          telegramId: 1
        }),
      (e: any) => String(e?.message).includes("bind_code_failed:500")
    );
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("bot: createBindCode 成功解析 code/expiresAt", async () => {
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({ code: "ABCDEFGHJK", expiresAt: new Date().toISOString() }),
      { status: 200, headers: { "content-type": "application/json" } }
    )) as any;
  try {
    const out = await createBindCode({
      apiBaseUrl: "http://localhost:3000",
      telegramId: 1,
      language: "zh-CN"
    });
    assert.equal(out.code, "ABCDEFGHJK");
    assert.ok(out.expiresAt);
  } finally {
    globalThis.fetch = prevFetch;
  }
});

