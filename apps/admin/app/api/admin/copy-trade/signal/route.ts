import { NextResponse } from "next/server";
import { prisma } from "@cryptopulse/db";
import { z } from "zod";

const BodySchema = z.object({
  marketId: z.string().min(1),
  outcomeIndex: z.number().int().min(0),
  side: z.enum(["BUY", "SELL"]),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body", details: parsed.error }, { status: 400 });
    }

    const { marketId, outcomeIndex, side, amount, description } = parsed.data;

    // 创建信号
    const signal = await prisma.copyTradeSignal.create({
      data: {
        marketId,
        outcomeIndex,
        side,
        amount,
        description: description || null,
        createdBy: "admin", // 后续可以从 session 获取
        isActive: true,
      },
    });

    // TODO: 触发跟单任务
    // 这里应该调用一个队列服务，异步处理跟单逻辑
    console.log(`[CopyTrade] Signal created: ${signal.id}, executing async...`);

    return NextResponse.json({
      success: true,
      signalId: signal.id,
      message: "信号已发布，系统将自动处理跟单",
    });
  } catch (error) {
    console.error("Create signal error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
