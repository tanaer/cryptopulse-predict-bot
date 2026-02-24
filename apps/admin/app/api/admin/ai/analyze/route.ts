import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  marketId: z.string().min(1),
  marketTitle: z.string().min(1),
  marketDescription: z.string().optional(),
});

export const runtime = "nodejs";

/**
 * AI 市场分析接口
 * 当前使用模板化摘要，可后续接入 LLM
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const { marketId, marketTitle, marketDescription } = parsed.data;

    // 模板化分析（后续可替换为 LLM 调用）
    const analysis = generateMarketAnalysis(marketTitle, marketDescription);

    return NextResponse.json({
      success: true,
      marketId,
      analysis,
      generatedAt: new Date().toISOString(),
      disclaimer: "本分析由 AI 自动生成，仅供参考，不构成投资建议。",
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}

function generateMarketAnalysis(title: string, description?: string): {
  summary: string;
  keyPoints: string[];
  risks: string[];
  scenarios: string[];
} {
  // 基于标题关键词的模板分析
  const titleLower = title.toLowerCase();
  
  // 检测市场类型
  const isCrypto = /btc|bitcoin|eth|ethereum|crypto|加密货币/i.test(titleLower);
  const isPolitics = /trump|biden|election|选举|总统|政治/i.test(titleLower);
  const isSports = /nba|football|soccer|体育|比赛/i.test(titleLower);

  let summary = "";
  let keyPoints: string[] = [];
  let risks: string[] = [];
  let scenarios: string[] = [];

  if (isCrypto) {
    summary = `这是一个加密货币相关的预测市场。加密市场波动性较大，价格受多种因素影响，包括宏观经济、监管政策、技术发展等。`;
    keyPoints = [
      "加密货币市场 24/7 全天候交易",
      "价格波动可能非常剧烈",
      "监管政策变化可能产生重大影响",
    ];
    risks = [
      "市场操纵风险",
      "监管政策不确定性",
      "技术风险（如交易所安全问题）",
    ];
    scenarios = [
      "看涨情景：市场突破关键阻力位，引发 FOMO 情绪",
      "看跌情景：监管利空或宏观经济恶化",
      "震荡情景：价格在区间内波动，等待明确方向",
    ];
  } else if (isPolitics) {
    summary = `这是一个政治事件预测市场。政治预测受民调数据、新闻事件、历史趋势等多重因素影响。`;
    keyPoints = [
      "民调数据是重要参考，但可能存在偏差",
      "突发事件可能快速改变市场预期",
      "历史数据有一定参考价值",
    ];
    risks = [
      "民调与实际结果偏差",
      "最后时刻的突发事件",
      "投票率不确定性",
    ];
    scenarios = [
      "预期情景：按照当前民调趋势发展",
      "意外情景：出现黑天鹅事件改变局势",
      "胶着情景：结果非常接近，难以预测",
    ];
  } else if (isSports) {
    summary = `这是一个体育赛事预测市场。体育比赛结果受球队状态、伤病情况、主客场因素等影响。`;
    keyPoints = [
      "近期战绩和状态很重要",
      "伤病情况可能改变比赛走势",
      "主场优势通常存在",
    ];
    risks = [
      "关键球员突发伤病",
      "天气等外部因素",
      "裁判判罚争议",
    ];
    scenarios = [
      "正常发挥：双方按预期水平比赛",
      "爆冷：弱势方超水平发挥",
      "一边倒：一方完全主导比赛",
    ];
  } else {
    summary = `这是一个综合类预测市场。建议关注相关新闻动态和市场情绪变化。`;
    keyPoints = [
      "关注相关新闻和公告",
      "观察市场资金流向",
      "参考历史类似事件",
    ];
    risks = [
      "信息不对称风险",
      "市场流动性风险",
      "不可预见的突发事件",
    ];
    scenarios = [
      "乐观情景：事件按预期方向发展",
      "悲观情景：出现不利变化",
      "中性情景：结果符合主流预期",
    ];
  }

  return { summary, keyPoints, risks, scenarios };
}
