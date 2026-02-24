import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { env } from "./env.js";
import { createBindCode, formatExpiresIn } from "./bind.js";
import { handleSearch, handleCategory, handleEventDetail, CATEGORY_NAMES } from "./search.js";
import { handleBuy, handleOrder } from "./trade.js";
import { handlePortfolio } from "./portfolio.js";

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
  const kb = new InlineKeyboard()
    .text("🔗 生成绑定链接", "gen_bind")
    .url("🌐 手动绑定", `${env.WEB_BASE_URL}/bind`)
    .row();

  kb.text(CATEGORY_NAMES.hot, "cat:hot")
    .text(CATEGORY_NAMES.new, "cat:new")
    .row();
    
  kb.text(CATEGORY_NAMES.crypto, "cat:crypto")
    .text(CATEGORY_NAMES.politics, "cat:politics")
    .row();

  kb.text("💼 我的仓位", "portfolio");

  await ctx.reply(
    [
      "👋 <b>欢迎使用 CryptoPulse Predict Bot</b>",
      "",
      "你可以在这里：",
      "• 🔎 搜索预测市场 (直接发送关键词)",
      "• 📈 下单交易 (支持限价/市价)",
      "• 💼 管理仓位与订单",
      "",
      "👇 <b>热门分类</b>",
      "点击下方按钮浏览市场，或直接发送关键词搜索。",
      "",
      "<i>本 Bot 仅为交易工具，不构成投资建议。</i>"
    ].join("\n"),
    { reply_markup: kb, parse_mode: "HTML" }
  );
});

bot.command("search", async (ctx) => {
  const query = ctx.match;
  if (!query) {
    return ctx.reply("🔍 请输入关键词，例如：<code>/search Trump</code>", { parse_mode: "HTML" });
  }
  await handleSearch(ctx, query);
});

bot.command("portfolio", async (ctx) => {
  await handlePortfolio(ctx);
});

async function handleBind(ctx: any) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const { code, expiresAt } = await createBindCode({
      apiBaseUrl: env.API_BASE_URL,
      botApiToken: env.BOT_API_TOKEN,
      telegramId,
      language: ctx.from?.language_code
    });
    const url = `${env.WEB_BASE_URL}/bind?code=${encodeURIComponent(code)}`;
    
    // URL Button is best UX
    const kb = new InlineKeyboard().url("👉 点击这里完成绑定", url);

    await ctx.reply(
      [
        "🔗 <b>绑定链接已生成</b>",
        "",
        `绑定码：<code>${code}</code>`,
        formatExpiresIn(expiresAt),
        "",
        "点击下方按钮，或复制绑定码在网页中输入。",
        "<i>(链接有效期 10 分钟)</i>"
      ].join("\n"),
      { reply_markup: kb, parse_mode: "HTML" }
    );
  } catch (e) {
    console.error("bind_error", e);
    const errorMsg = e instanceof Error ? e.message : "未知错误";
    await ctx.reply(`❌ 生成绑定链接失败：${errorMsg}`);
  }
}

bot.command("bind", handleBind);

bot.hears(/^\/event_(.+)$/, async (ctx) => {
  const eventId = ctx.match[1];
  await handleEventDetail(ctx, eventId);
});

bot.on("message:text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return; 
  await handleSearch(ctx, ctx.message.text);
});

bot.callbackQuery("gen_bind", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleBind(ctx);
});

bot.callbackQuery(/^cat:([^:]+)(?::(\d+))?$/, async (ctx) => {
  const category = ctx.match[1];
  const page = ctx.match[2] ? parseInt(ctx.match[2]) : 0;
  
  await ctx.answerCallbackQuery();
  await handleCategory(ctx, category, page);
});

bot.callbackQuery(/^search:(.+):(\d+)$/, async (ctx) => {
  const query = ctx.match[1];
  const page = parseInt(ctx.match[2]);
  
  await ctx.answerCallbackQuery();
  await handleSearch(ctx, query, page);
});

bot.callbackQuery(/^buy:([^:]+):(\d+)$/, async (ctx) => {
  const marketId = ctx.match[1];
  const outcomeIndex = parseInt(ctx.match[2]);
  
  await ctx.answerCallbackQuery();
  await handleBuy(ctx, marketId, outcomeIndex);
});

bot.callbackQuery(/^order:([^:]+):(\d+):(\d+)$/, async (ctx) => {
    const marketId = ctx.match[1];
    const outcomeIndex = parseInt(ctx.match[2]);
    const amount = ctx.match[3];
    
    await ctx.answerCallbackQuery();
    await handleOrder(ctx, marketId, outcomeIndex, amount);
});

bot.callbackQuery("cancel_order", async (ctx) => {
    await ctx.deleteMessage();
});

bot.callbackQuery("portfolio", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handlePortfolio(ctx);
});

bot.callbackQuery(/^ai:(.+)$/, async (ctx) => {
  const marketId = ctx.match[1];
  await ctx.answerCallbackQuery("正在分析...");
  
  try {
    const response = await fetch(`${env.API_BASE_URL}/api/admin/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketId,
        marketTitle: "市场分析", // 实际应该从缓存获取市场标题
      }),
    });

    if (!response.ok) {
      await ctx.reply("❌ AI 分析暂时不可用，请稍后重试。");
      return;
    }

    const data = await response.json() as {
      analysis: {
        summary: string;
        keyPoints: string[];
        risks: string[];
        scenarios: string[];
      };
      disclaimer: string;
    };

    const { analysis, disclaimer } = data;
    
    let text = `🤖 <b>AI 市场解读</b>\n\n`;
    text += `<b>摘要</b>\n${analysis.summary}\n\n`;
    
    text += `<b>关键要点</b>\n`;
    analysis.keyPoints.forEach((point, i) => {
      text += `${i + 1}. ${point}\n`;
    });
    text += `\n`;
    
    text += `<b>风险提示</b>\n`;
    analysis.risks.forEach((risk, i) => {
      text += `• ${risk}\n`;
    });
    text += `\n`;
    
    text += `<b>可能情景</b>\n`;
    analysis.scenarios.forEach((scenario, i) => {
      text += `• ${scenario}\n`;
    });
    text += `\n`;
    
    text += `<i>${disclaimer}</i>`;

    await ctx.reply(text, { parse_mode: "HTML" });
  } catch (error) {
    console.error("AI analysis error:", error);
    await ctx.reply("❌ AI 分析失败，请稍后重试。");
  }
});

// 返回首页回调
bot.callbackQuery("go_home", async (ctx) => {
  await ctx.answerCallbackQuery();

  const kb = new InlineKeyboard()
    .text("🔗 生成绑定链接", "gen_bind")
    .url("🌐 手动绑定", `${env.WEB_BASE_URL}/bind`)
    .row();

  kb.text("🔥 今日热点", "cat:hot")
    .text("✨ 最新上线", "cat:new")
    .row();

  kb.text("💰 加密货币", "cat:crypto")
    .text("🇺🇸 政治", "cat:politics")
    .row();

  kb.text("💼 我的仓位", "portfolio");

  await ctx.editMessageText(
    [
      "👋 <b>欢迎使用 CryptoPulse Predict Bot</b>",
      "",
      "你可以在这里：",
      "• 🔎 搜索预测市场 (直接发送关键词)",
      "• 📈 下单交易 (支持限价/市价)",
      "• 💼 管理仓位与订单",
      "",
      "👇 <b>热门分类</b>",
      "点击下方按钮浏览市场，或直接发送关键词搜索。",
      "",
      "<i>本 Bot 仅为交易工具，不构成投资建议。</i>"
    ].join("\n"),
    { reply_markup: kb, parse_mode: "HTML" }
  );
});

bot.catch(async (err) => {
  console.error("bot_error", err);
});

bot.start();

