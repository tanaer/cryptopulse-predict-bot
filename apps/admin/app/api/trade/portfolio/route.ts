import { NextResponse } from "next/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const QuerySchema = z.object({
  telegramId: z.coerce.number().int().positive()
});

function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? "";
}

export async function GET(req: Request) {
  const apiToken = process.env.BOT_API_TOKEN ?? "";
  const provided = getBearerToken(req);
  if (!apiToken || provided !== apiToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  let prisma: PrismaClient;
  try {
    prisma = (await import("@cryptopulse/db")).prisma as PrismaClient;
  } catch {
    return NextResponse.json({ error: "prisma_unavailable" }, { status: 503 });
  }

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ telegramId: url.searchParams.get("telegramId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const telegramId = BigInt(parsed.data.telegramId);
  try {
    const orders = await prisma.tradeOrder.findMany({
      where: { telegramId },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    const positions = new Map<string, { marketId: string; outcomeIndex: number; amount: number }>();
    for (const o of orders) {
      const key = `${o.marketId}:${o.outcomeIndex}`;
      const prev = positions.get(key) ?? { marketId: o.marketId, outcomeIndex: o.outcomeIndex, amount: 0 };
      const delta = o.side === "SELL" ? -o.amount : o.amount;
      positions.set(key, { ...prev, amount: prev.amount + delta });
    }

    const posArr = Array.from(positions.values())
      .filter((p) => Math.abs(p.amount) > 1e-9)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    const recent = orders.slice(0, 20).map((o) => ({
      id: o.id,
      marketId: o.marketId,
      outcomeIndex: o.outcomeIndex,
      side: o.side,
      amount: o.amount,
      status: o.status,
      orderId: o.orderId,
      avgPrice: o.avgPrice,
      txHash: o.txHash,
      createdAt: o.createdAt.toISOString()
    }));

    return NextResponse.json({ positions: posArr, recentOrders: recent });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

