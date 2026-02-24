import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@cryptopulse/db";
import { POST } from "../apps/admin/app/api/bot/bind-code/route";

function ensureLocalDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return { ok: false as const, reason: "DATABASE_URL 未设置" };
  if (!/localhost|127\.0\.0\.1/i.test(url))
    return { ok: false as const, reason: "DATABASE_URL 不是本机地址，测试已跳过" };
  return { ok: true as const };
}

const db = ensureLocalDb();

beforeEach(() => {
  process.env.BOT_API_TOKEN = "testtoken";
});

afterEach(async () => {
  if (!db.ok) return;
  await prisma.bindCode.deleteMany({ where: { telegramId: 91001n } });
  await prisma.user.deleteMany({ where: { telegramId: 91001n } });
});

test("bind-code: production 下未配置 BOT_API_TOKEN 返回 401", async () => {
  if (!db.ok) return test.skip(db.reason);

  const prevEnv = process.env.NODE_ENV;
  const prevToken = process.env.BOT_API_TOKEN;
  process.env.NODE_ENV = "production";
  delete process.env.BOT_API_TOKEN;

  try {
    const req = new Request("http://localhost/api/bot/bind-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ telegramId: 91001, language: "zh-CN" })
    });
    const res = await POST(req);
    assert.equal(res.status, 401);
  } finally {
    process.env.NODE_ENV = prevEnv;
    if (prevToken) process.env.BOT_API_TOKEN = prevToken;
  }
});

test("bind-code: 鉴权失败返回 401", async () => {
  if (!db.ok) return test.skip(db.reason);

  const req = new Request("http://localhost/api/bot/bind-code", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer wrong"
    },
    body: JSON.stringify({ telegramId: 91001, language: "zh-CN" })
  });
  const res = await POST(req);
  assert.equal(res.status, 401);
});

test("bind-code: 成功返回 code 与 expiresAt，并落库 BindCode", async () => {
  if (!db.ok) return test.skip(db.reason);

  const req = new Request("http://localhost/api/bot/bind-code", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer testtoken"
    },
    body: JSON.stringify({ telegramId: 91001, language: "zh-CN" })
  });
  const res = await POST(req);
  assert.equal(res.status, 200);

  const json = (await res.json()) as { code: string; expiresAt: string };
  assert.ok(/^[A-Z2-9]{10}$/.test(json.code));
  assert.ok(Number.isFinite(new Date(json.expiresAt).getTime()));

  const row = await prisma.bindCode.findUnique({ where: { code: json.code } });
  assert.ok(row);
  assert.equal(row?.telegramId, 91001n);
  assert.equal(row?.usedAt, null);
});

