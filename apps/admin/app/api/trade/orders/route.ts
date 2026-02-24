import { NextResponse } from "next/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const QuerySchema = z.object({
  telegramId: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().min(1).max(100).optional()
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
  const parsed = QuerySchema.safeParse({
    telegramId: url.searchParams.get("telegramId"),
    limit: url.searchParams.get("limit")
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const telegramId = BigInt(parsed.data.telegramId);
  const limit = parsed.data.limit ?? 20;

  try {
    const orders = await prisma.tradeOrder.findMany({
      where: { telegramId },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
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
      }))
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

