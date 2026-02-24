import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@cryptopulse/db";
import { POST } from "../apps/admin/app/api/trade/order/route";

function ensureLocalDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return { ok: false as const, reason: "DATABASE_URL 未设置" };
  if (!/localhost|127\.0\.0\.1/i.test(url))
    return { ok: false as const, reason: "DATABASE_URL 不是本机地址，测试已跳过" };
  return { ok: true as const };
}

const db = ensureLocalDb();

async function ensureTradeOrderTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TradeOrder" (
      "id" TEXT NOT NULL,
      "telegramId" BIGINT NOT NULL,
      "marketId" TEXT NOT NULL,
      "outcomeIndex" INTEGER NOT NULL,
      "side" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "orderId" TEXT,
      "avgPrice" DOUBLE PRECISION,
      "txHash" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "TradeOrder_pkey" PRIMARY KEY ("id")
    );
  `);
}

beforeEach(async () => {
  process.env.BOT_API_TOKEN = "testtoken";
  process.env.TRADE_MODE = "mock";
  if (!db.ok) return;
  await ensureTradeOrderTable();
});

afterEach(async () => {
  if (!db.ok) return;
  await prisma.tradeOrder.deleteMany({ where: { telegramId: 92001n } });
  await prisma.user.deleteMany({ where: { telegramId: 92001n } });
});

test("trade-order: 鉴权失败返回 401", async () => {
  if (!db.ok) return test.skip(db.reason);

  const req = new Request("http://localhost/api/trade/order", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer wrong" },
    body: JSON.stringify({ telegramId: 92001, marketId: "m1", outcomeIndex: 0, amount: 10, side: "BUY" })
  });

  const res = await POST(req);
  assert.equal(res.status, 401);
});

test("trade-order: 未绑定用户返回 400", async () => {
  if (!db.ok) return test.skip(db.reason);

  await prisma.user.create({ data: { telegramId: 92001n } });

  const req = new Request("http://localhost/api/trade/order", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer testtoken" },
    body: JSON.stringify({ telegramId: 92001, marketId: "m1", outcomeIndex: 0, amount: 10, side: "BUY" })
  });

  const res = await POST(req);
  assert.equal(res.status, 400);
  const json = (await res.json()) as { error: string };
  assert.equal(json.error, "user_not_bound");
});

test("trade-order: mock 模式下创建订单并返回 SIMULATED_FILLED", async () => {
  if (!db.ok) return test.skip(db.reason);

  await prisma.user.create({ data: { telegramId: 92001n, polymarketAddress: "0x2222222222222222222222222222222222222222" } });

  const req = new Request("http://localhost/api/trade/order", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer testtoken" },
    body: JSON.stringify({ telegramId: 92001, marketId: "m1", outcomeIndex: 1, amount: 50, side: "BUY" })
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const json = (await res.json()) as { status: string; mode: string; orderId: string; id: string };
  assert.equal(json.mode, "mock");
  assert.equal(json.status, "SIMULATED_FILLED");
  assert.ok(json.orderId);
  assert.ok(json.id);

  const row = await prisma.tradeOrder.findUnique({ where: { id: json.id } });
  assert.ok(row);
  assert.equal(row?.telegramId, 92001n);
  assert.equal(row?.marketId, "m1");
  assert.equal(row?.outcomeIndex, 1);
  assert.equal(row?.side, "BUY");
});

