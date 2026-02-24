
import { Context, InlineKeyboard } from "grammy";
import { GammaClient, GammaEvent, GammaMarket } from "@cryptopulse/polymarket";

const gamma = new GammaClient();

const CATEGORIES: Record<string, string> = {
  crypto: "1",
  politics: "2",
  sports: "3",
  business: "6",
  science: "4",
  pop_culture: "5",
};

export const CATEGORY_NAMES: Record<string, string> = {
  crypto: "💰 加密货币",
  politics: "🇺🇸 政治",
  sports: "🏆 体育",
  business: "💼 商业",
  science: "🔬 科学",
  pop_culture: "🎵 流行文化",
  hot: "🔥 今日热点",
  new: "✨ 最新上线",
};

export async function handleSearch(ctx: Context, query: string, page: number = 0) {
  try {
    const limit = 5;
    const offset = page * limit;
    
    const events = await gamma.getEvents({
      q: query,
      limit,
      offset,
      active: true,
      closed: false,
      archived: false,
    });

    if (!events || events.length === 0) {
      if (page === 0) {
        await ctx.reply(`🔍 未找到与 "${query}" 相关的市场。请尝试其他关键词。`);
      } else {
        await ctx.answerCallbackQuery("没有更多结果了");
      }
      return;
    }

    const text = formatEventList(events, `🔍 "${query}" 的搜索结果 (第 ${page + 1} 页)`, page, `search:${query}`);
    const keyboard = createPaginationKeyboard(events.length, page, `search:${query}`);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { reply_markup: keyboard, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
    } else {
      await ctx.reply(text, { reply_markup: keyboard, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
    }
  } catch (error) {
    console.error("Search error:", error);
    await ctx.reply("❌ 搜索失败，请稍后重试。");
  }
}

export async function handleCategory(ctx: Context, category: string, page: number = 0) {
  try {
    const limit = 5;
    const offset = page * limit;
    
    let params: any = {
      limit,
      offset,
      active: true,
      closed: false,
      archived: false,
    };

    if (category === "hot") {
      params.order = "volume";
      params.ascending = false;
    } else if (category === "new") {
      params.order = "startDate";
      params.ascending = false;
    } else {
      params.tag_id = CATEGORIES[category];
    }

    const events = await gamma.getEvents(params);

    if (!events || events.length === 0) {
      if (page === 0) {
        await ctx.reply(`📂 ${CATEGORY_NAMES[category] || category} 分类下暂无市场。`);
      } else {
        await ctx.answerCallbackQuery("没有更多结果了");
      }
      return;
    }

    const title = `📂 <b>${CATEGORY_NAMES[category] || category}</b> (第 ${page + 1} 页)`;
    const text = formatEventList(events, title, page, `cat:${category}`);
    const keyboard = createPaginationKeyboard(events.length, page, `cat:${category}`);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { reply_markup: keyboard, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
    } else {
      await ctx.reply(text, { reply_markup: keyboard, parse_mode: "HTML", link_preview_options: { is_disabled: true } });
    }
  } catch (error) {
    console.error("Category error:", error);
    await ctx.reply("❌ 获取分类失败，请稍后重试。\n\n可能原因：\n• 网络连接问题\n• Polymarket API 暂时不可用\n• 请检查服务器网络状态");
  }
}

export async function handleEventDetail(ctx: Context, eventId: string) {
  try {
    const event = await gamma.getEvent(eventId);
    if (!event) {
      await ctx.reply("❌ 市场不存在或已下架。");
      return;
    }

    const market = event.markets?.[0];
    if (!market) {
      await ctx.reply("❌ 该事件下暂无有效市场。");
      return;
    }

    const text = formatEventDetail(event, market);
    const keyboard = new InlineKeyboard();

    const outcomes = JSON.parse(market.outcomes as any);
    const prices = JSON.parse(market.outcomePrices as any);

    if (Array.isArray(outcomes) && Array.isArray(prices)) {
        outcomes.forEach((outcome: string, index: number) => {
            const price = parseFloat(prices[index] || "0").toFixed(2);
            keyboard.text(`Buy ${outcome} ($${price})`, `buy:${market.id}:${index}`).row();
        });
    }

    keyboard.url("🌐 在网页查看", `https://polymarket.com/event/${event.slug}`).row();
    keyboard.text("🤖 AI 解读", `ai:${market.id}`).row();
    keyboard.text("🔙 热门市场", "cat:hot");
    
    if (event.image) {
        await ctx.replyWithPhoto(event.image, { 
            caption: text, 
            reply_markup: keyboard, 
            parse_mode: "HTML" 
        });
    } else {
        await ctx.reply(text, { reply_markup: keyboard, parse_mode: "HTML" });
    }
  } catch (error) {
    console.error("Event detail error:", error);
    await ctx.reply("❌ 获取详情失败，请稍后重试。");
  }
}

function formatEventList(events: GammaEvent[], title: string, page: number, actionPrefix: string): string {
  let text = `${title}\n\n`;

  events.forEach((event, index) => {
    const market = event.markets?.[0];
    const priceInfo = market ? formatPrices(market) : "";
    const volume = event.volume ? `$${formatNumber(event.volume)}` : "N/A";
    
    text += `${index + 1}. <b><a href="https://polymarket.com/event/${event.slug}">${event.title}</a></b>\n`;
    text += `   💰 Vol: ${volume} | ${priceInfo}\n`;
    text += `   👉 /event_${event.id}\n\n`;
  });

  return text;
}

function formatEventDetail(event: GammaEvent, market: GammaMarket): string {
  const volume = event.volume ? `$${formatNumber(event.volume)}` : "N/A";
  const liquidity = event.liquidity ? `$${formatNumber(event.liquidity)}` : "N/A";
  const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString() : "N/A";
  const vol24 = market.volume24hr ? `$${formatNumber(parseFloat(market.volume24hr))}` : "N/A";

  let text = `<b>${event.title}</b>\n\n`;
  
  const desc = event.description || "";
  const maxDesc = 500;
  text += desc.length > maxDesc ? `${desc.slice(0, maxDesc)}...\n\n` : `${desc}\n\n`;

  text += `📅 截止: ${endDate}\n`;
  text += `💧 流动性: ${liquidity}\n`;
  text += `💰 交易量: ${volume} (24h: ${vol24})\n\n`;
  
  text += `<b>当前价格:</b>\n`;
  text += formatPrices(market, true);

  return text;
}

function formatPrices(market: GammaMarket, detail: boolean = false): string {
  try {
    const outcomes = JSON.parse(market.outcomes as any);
    const prices = JSON.parse(market.outcomePrices as any);

    if (!Array.isArray(outcomes) || !Array.isArray(prices)) return "";

    return outcomes.map((o, i) => {
      const p = parseFloat(prices[i] || "0");
      const percent = Math.round(p * 100);
      return `${o}: ${percent}%`;
    }).join(detail ? "\n" : " | ");
  } catch {
    return "";
  }
}

function createPaginationKeyboard(count: number, page: number, actionPrefix: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  const limit = 5;

  if (page > 0) {
    kb.text("⬅️ 上一页", `${actionPrefix}:${page - 1}`);
  }

  if (count >= limit) {
    kb.text("下一页 ➡️", `${actionPrefix}:${page + 1}`);
  }

  // 添加返回首页按钮
  if (page > 0 || count >= limit) {
    kb.row();
  }
  kb.text("🏠 返回首页", "go_home");

  return kb;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}
