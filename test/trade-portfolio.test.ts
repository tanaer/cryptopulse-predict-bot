import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { prisma } from "@cryptopulse/db";
import { GET } from "../apps/admin/app/api/trade/portfolio/route";

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
  if (!db.ok) return;
  await ensureTradeOrderTable();
});

afterEach(async () => {
  if (!db.ok) return;
  await prisma.tradeOrder.deleteMany({ where: { telegramId: 92002n } });
  await prisma.user.deleteMany({ where: { telegramId: 92002n } });
});

test("trade-portfolio: 返回仓位汇总与最近订单", async () => {
  if (!db.ok) return test.skip(db.reason);

  await prisma.user.create({ data: { telegramId: 92002n, polymarketAddress: "0x2222222222222222222222222222222222222222" } });

  await prisma.tradeOrder.createMany({
    data: [
      {
        telegramId: 92002n,
        marketId: "m1",
        outcomeIndex: 0,
        side: "BUY",
        amount: 10,
        status: "SIMULATED_FILLED",
        orderId: "o1"
      },
      {
        telegramId: 92002n,
        marketId: "m1",
        outcomeIndex: 0,
        side: "BUY",
        amount: 5,
        status: "SIMULATED_FILLED",
        orderId: "o2"
      }
    ]
  });

  const req = new Request("http://localhost/api/trade/portfolio?telegramId=92002", {
    method: "GET",
    headers: { authorization: "Bearer testtoken" }
  });

  const res = await GET(req);
  assert.equal(res.status, 200);
  const json = (await res.json()) as {
    positions: { marketId: string; outcomeIndex: number; amount: number }[];
    recentOrders: unknown[];
  };

  assert.equal(json.positions.length, 1);
  assert.equal(json.positions[0]?.marketId, "m1");
  assert.equal(json.positions[0]?.outcomeIndex, 0);
  assert.equal(Math.round(json.positions[0]?.amount ?? 0), 15);
  assert.ok(json.recentOrders.length >= 2);
});

