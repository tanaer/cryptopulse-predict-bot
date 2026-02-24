import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@cryptopulse/db";
import { POST } from "../apps/admin/app/api/bind/confirm/route";

function ensureLocalDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return { ok: false as const, reason: "DATABASE_URL 未设置" };
  if (!/localhost|127\.0\.0\.1/i.test(url))
    return { ok: false as const, reason: "DATABASE_URL 不是本机地址，测试已跳过" };
  return { ok: true as const };
}

const db = ensureLocalDb();
const telegramId = 92001n;

beforeEach(async () => {
  if (!db.ok) return;
  await prisma.user.upsert({
    where: { telegramId },
    update: {},
    create: { telegramId }
  });
});

afterEach(async () => {
  if (!db.ok) return;
  await prisma.bindCode.deleteMany({ where: { telegramId } });
  await prisma.user.deleteMany({ where: { telegramId } });
});

test("bind/confirm: code 不存在返回 404", async () => {
  if (!db.ok) return test.skip(db.reason);

  const req = new Request("http://localhost/api/bind/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "NOTEXIST",
      polymarketAddress: "",
      safeAddress: "",
      funderAddress: ""
    })
  });
  const res = await POST(req);
  assert.equal(res.status, 404);
});

test("bind/confirm: 成功绑定会写入 User 并标记 usedAt", async () => {
  if (!db.ok) return test.skip(db.reason);

  const code = "TESTBIND01A";
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.bindCode.create({
    data: {
      code,
      telegramId,
      expiresAt
    }
  });

  const req = new Request("http://localhost/api/bind/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code,
      polymarketAddress: "0x2222222222222222222222222222222222222222",
      safeAddress: "",
      funderAddress: ""
    })
  });
  const res = await POST(req);
  assert.equal(res.status, 200);
  const json = (await res.json()) as { ok: boolean };
  assert.equal(json.ok, true);

  const user = await prisma.user.findUnique({ where: { telegramId } });
  assert.equal(user?.polymarketAddress, "0x2222222222222222222222222222222222222222");

  const bc = await prisma.bindCode.findUnique({ where: { code } });
  assert.ok(bc?.usedAt);
});

test("bind/confirm: 重复使用同一 code 返回 409", async () => {
  if (!db.ok) return test.skip(db.reason);

  const code = "TESTBIND02B";
  await prisma.bindCode.create({
    data: {
      code,
      telegramId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: new Date()
    }
  });

  const req = new Request("http://localhost/api/bind/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code,
      polymarketAddress: "",
      safeAddress: "",
      funderAddress: ""
    })
  });
  const res = await POST(req);
  assert.equal(res.status, 409);
});

