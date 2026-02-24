import { Context, InlineKeyboard } from "grammy";
import { GammaClient } from "@cryptopulse/polymarket";
import { env } from "./env.js";

const gamma = new GammaClient();

export async function handleBuy(ctx: Context, marketId: string, outcomeIndex: number) {
  try {
    const market = await gamma.getMarket(marketId);
    if (!market) {
      await ctx.reply("❌ 市场不存在或已下架。");
      return;
    }

    const outcomes = JSON.parse(market.outcomes as any);
    const outcome = outcomes[outcomeIndex];
    if (!outcome) {
      await ctx.reply("❌ 选项无效。");
      return;
    }

    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (!env.DATABASE_URL) {
      await ctx.reply("⚠️ 系统未配置数据库，暂无法交易。");
      return;
    }

    try {
      const { prisma } = (await import("@cryptopulse/db")) as unknown as {
        prisma: { user: { findUnique: (args: unknown) => Promise<{ polymarketAddress: string | null } | null> } };
      };

      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) }
      });

      if (!user || !user.polymarketAddress) {
        await ctx.reply("⚠️ 你尚未绑定 Polymarket 账户，无法交易。\n请先点击「🔗 生成绑定链接」进行绑定。");
        return;
      }
    } catch (e) {
      console.error("Database check error:", e);
      await ctx.reply("⚠️ 数据库连接失败，请稍后重试。如果问题持续，请联系管理员检查服务状态。");
      return;
    }

    const kb = new InlineKeyboard()
      .text("10 USDC", `order:${marketId}:${outcomeIndex}:10`)
      .text("50 USDC", `order:${marketId}:${outcomeIndex}:50`)
      .text("100 USDC", `order:${marketId}:${outcomeIndex}:100`)
      .row()
      .text("❌ 取消", "cancel_order");

    await ctx.reply(
      `<b>下单确认</b>\n\n` +
        `市场: ${market.groupItemTitle || market.question}\n` +
        `方向: <b>Buy ${outcome}</b>\n\n` +
        `请选择下单金额 (USDC):`,
      { reply_markup: kb, parse_mode: "HTML" }
    );
  } catch (error) {
    console.error("buy_error", error);
    await ctx.reply("❌ 启动交易失败，请稍后重试。");
  }
}

export async function handleOrder(ctx: Context, marketId: string, outcomeIndex: number, amount: string) {
  try {
    await ctx.editMessageText("⏳ 正在提交订单...", { parse_mode: "HTML" });

    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (!env.BOT_API_TOKEN) {
      await ctx.editMessageText("⚠️ 系统未配置交易权限（BOT_API_TOKEN），暂无法下单。");
      return;
    }

    const response = await fetch(`${env.API_BASE_URL}/api/trade/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.BOT_API_TOKEN}`
      },
      body: JSON.stringify({
        telegramId,
        marketId,
        outcomeIndex,
        amount: parseFloat(amount),
        side: "BUY"
      })
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(`Order failed: ${response.status} ${JSON.stringify(errorJson)}`);
    }

    const result = (await response.json()) as { orderId?: string; status?: string; mode?: string };

    await ctx.editMessageText(
      `✅ <b>订单提交成功!</b>\n\n` +
        `市场 ID: ${marketId}\n` +
        `方向: 选项 ${outcomeIndex}\n` +
        `金额: ${amount} USDC\n` +
        `订单 ID: ${result.orderId ?? "-"}\n` +
        `状态: ${result.status ?? "-"}\n\n` +
        `<i>(当前为 ${result.mode ?? "unknown"} 模式)</i>`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.error("order_error", error);
    await ctx.editMessageText("❌ 订单提交失败，请稍后重试。");
  }
}

