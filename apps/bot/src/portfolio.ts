import { Context } from "grammy";
import { env } from "./env.js";

export async function handlePortfolio(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (!env.BOT_API_TOKEN) {
      await ctx.reply("⚠️ 系统未配置 API 访问权限，暂无法查询仓位。请联系管理员配置 BOT_API_TOKEN。");
      return;
    }

    const url = new URL(`${env.API_BASE_URL}/api/trade/portfolio`);
    url.searchParams.set("telegramId", String(telegramId));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { authorization: `Bearer ${env.BOT_API_TOKEN}` }
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`Portfolio API error: ${res.status}`, txt);
      if (res.status === 404) {
        await ctx.reply("❌ 查询仓位失败：API 接口未找到（404）。请确认 admin 服务已正确部署。");
      } else if (res.status === 401) {
        await ctx.reply("❌ 查询仓位失败：API 认证失败（401）。请检查 BOT_API_TOKEN 配置。");
      } else if (res.status === 503) {
        await ctx.reply("❌ 查询仓位失败：数据库服务不可用（503）。请稍后重试。");
      } else {
        await ctx.reply(`❌ 查询仓位失败（${res.status}）。请稍后重试。`);
      }
      return;
    }

    const json = (await res.json()) as {
      positions: { marketId: string; outcomeIndex: number; amount: number }[];
      recentOrders: {
        marketId: string;
        outcomeIndex: number;
        side: string;
        amount: number;
        status: string;
        createdAt: string;
      }[];
    };

    const positions = json.positions ?? [];
    const recent = json.recentOrders ?? [];

    if (positions.length === 0 && recent.length === 0) {
      await ctx.reply("📭 暂无仓位与订单记录。你可以先浏览市场并尝试下单。");
      return;
    }

    let text = "💼 <b>我的仓位</b>\n\n";

    if (positions.length > 0) {
      text += "<b>仓位汇总</b>\n";
      for (const p of positions.slice(0, 12)) {
        text += `• 市场: <code>${p.marketId}</code> 选项: ${p.outcomeIndex} 数量: ${p.amount.toFixed(2)}\n`;
      }
      if (positions.length > 12) {
        text += `… 还有 ${positions.length - 12} 条\n`;
      }
      text += "\n";
    }

    if (recent.length > 0) {
      text += "<b>最近订单</b>\n";
      for (const o of recent.slice(0, 8)) {
        const t = new Date(o.createdAt).toLocaleString();
        text += `• ${t} ${o.side} ${o.amount} | 市场: <code>${o.marketId}</code> 选项: ${o.outcomeIndex} | ${o.status}\n`;
      }
    }

    await ctx.reply(text, { parse_mode: "HTML" });
  } catch (e) {
    console.error("portfolio_error", e);
    await ctx.reply("❌ 查询仓位失败，请稍后重试。");
  }
}

