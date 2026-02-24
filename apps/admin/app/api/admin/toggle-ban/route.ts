import { NextResponse } from "next/server";
import { prisma } from "@cryptopulse/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const telegramId = formData.get("telegramId") as string;

    if (!telegramId) {
      return NextResponse.json({ error: "缺少 telegramId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { isBanned: !user.isBanned },
    });

    return NextResponse.redirect(new URL("/admin/users", request.url));
  } catch (error) {
    console.error("Toggle ban error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
