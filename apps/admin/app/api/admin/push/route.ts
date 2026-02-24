import { NextResponse } from "next/server";
import { prisma } from "@cryptopulse/db";

// 简单的内存存储，实际生产环境应该使用数据库
const pushHistory: Array<{
  id: string;
  message: string;
  target: string;
  sentAt: Date;
  recipientCount: number;
}> = [];

export async function POST(request: Request) {
  try {
    const { message, target } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 });
    }

    if (message.length > 4096) {
      return NextResponse.json({ error: "消息长度不能超过 4096 字符" }, { status: 400 });
    }

    // 获取目标用户
    const where = target === "active" 
      ? { isBanned: false, tradeOrders: { some: {} } }
      : { isBanned: false };

    const users = await prisma.user.findMany({
      where,
      select: { telegramId: true },
    });

    // TODO: 实际调用 Telegram Bot API 发送消息
    // 这里只是模拟
    console.log(`[Push] Sending to ${users.length} users:`, message);

    // 记录推送历史
    pushHistory.unshift({
      id: Math.random().toString(36).substring(7),
      message: message.trim(),
      target: target === "active" ? "活跃用户" : "全部用户",
      sentAt: new Date(),
      recipientCount: users.length,
    });

    return NextResponse.json({
      success: true,
      message: `推送已发送给 ${users.length} 位用户`,
      recipientCount: users.length,
    });
  } catch (error) {
    console.error("Push error:", error);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ history: pushHistory });
}
