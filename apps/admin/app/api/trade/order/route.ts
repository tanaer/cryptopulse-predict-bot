
import { NextResponse } from "next/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const BodySchema = z.object({
  telegramId: z.number().int().positive(),
  marketId: z.string().min(1),
  outcomeIndex: z.number().int().min(0),
  amount: z.number().positive(),
  side: z.enum(["BUY", "SELL"])
});

export async function POST(req: Request) {
  const apiToken = process.env.BOT_API_TOKEN ?? "";
  const authHeader = req.headers.get("authorization") ?? "";
  const providedToken = authHeader.replace(/^Bearer\s+/i, "");
  
  if (!apiToken || providedToken !== apiToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error }, { status: 400 });
  }

  const { telegramId, marketId, outcomeIndex, amount, side } = parsed.data;

  if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  let prisma: PrismaClient;
  try {
    prisma = (await import("@cryptopulse/db")).prisma as PrismaClient;
  } catch {
    return NextResponse.json({ error: "prisma_unavailable" }, { status: 503 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user || !user.polymarketAddress) {
        return NextResponse.json({ error: "user_not_bound" }, { status: 400 });
    }

    console.log(`[Trade] User ${telegramId} ${side} ${amount} USDC on market ${marketId} outcome ${outcomeIndex}`);

    const tradeMode = (process.env.TRADE_MODE ?? "mock").toLowerCase();
    const now = new Date();
    const orderId = `order-${now.getTime()}`;

    const row = await prisma.tradeOrder.create({
      data: {
        telegramId: BigInt(telegramId),
        marketId,
        outcomeIndex,
        side,
        amount,
        status: tradeMode === "mock" ? "SIMULATED_FILLED" : "PENDING",
        orderId,
        avgPrice: tradeMode === "mock" ? 0.5 : null,
        txHash: tradeMode === "mock" ? "0x1234567890abcdef" : null
      }
    });

    return NextResponse.json({
      success: true,
      mode: tradeMode,
      id: row.id,
      orderId: row.orderId,
      status: row.status,
      filledAmount: row.amount,
      avgPrice: row.avgPrice,
      txHash: row.txHash
    });
  } catch (error) {
    console.error("Trade execution error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
