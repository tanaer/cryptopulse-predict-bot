"use client";

import { useState } from "react";
import { Signal, Play, Pause, Users } from "lucide-react";

export default function CopyTradePage() {
  const [marketId, setMarketId] = useState("");
  const [outcomeIndex, setOutcomeIndex] = useState("0");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!marketId || !amount) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/copy-trade/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId,
          outcomeIndex: parseInt(outcomeIndex),
          side,
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "信号已发布" : "发布失败"),
      });

      if (response.ok) {
        setMarketId("");
        setAmount("");
        setDescription("");
      }
    } catch (error) {
      setResult({ success: false, message: "网络错误，请重试" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">复制交易</h1>
        <p className="text-sm text-neutral-600">发布交易信号，用户可配置自动跟单</p>
      </div>

      {result && (
        <div
          className={`rounded-lg p-4 text-sm ${
            result.success
              ? "border border-green-200 bg-green-50 text-green-900"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 发布信号 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Signal className="w-5 h-5" />
            发布交易信号
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                市场 ID
              </label>
              <input
                type="text"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                placeholder="例如: 0x1234..."
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  选项索引
                </label>
                <select
                  value={outcomeIndex}
                  onChange={(e) => setOutcomeIndex(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="0">选项 0 (Yes)</option>
                  <option value="1">选项 1 (No)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  方向
                </label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
                  className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="BUY">买入</option>
                  <option value="SELL">卖出</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                参考金额 (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例如: 100"
                min="1"
                step="0.01"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <p className="mt-1 text-xs text-neutral-500">
                用户实际下单金额 = 参考金额 × 跟单比例
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                信号说明 (可选)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="例如: 看好 BTC 突破 10 万美元"
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !marketId || !amount}
              className="w-full px-4 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "发布中..." : "发布信号"}
            </button>
          </form>
        </div>

        {/* 说明 */}
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              跟单机制
            </h2>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">1.</span>
                用户在 Bot 中配置跟单参数（比例、最大金额）
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">2.</span>
                管理员在后台发布交易信号
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">3.</span>
                系统自动为开启跟单的用户执行对应订单
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">4.</span>
                用户收到订单执行通知
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium mb-1">风险提示</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>跟单交易存在风险，请确保用户了解风险</li>
              <li>建议设置合理的最大跟单金额限制</li>
              <li>市场波动可能导致实际成交价格与信号价格不同</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
