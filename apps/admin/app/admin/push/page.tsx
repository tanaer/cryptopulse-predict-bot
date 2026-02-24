"use client";

import { useState } from "react";
import { Send, Bell, Users } from "lucide-react";

export default function PushPage() {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "active">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), target }),
      });

      const data = await response.json();
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "推送已发送" : "发送失败"),
      });

      if (response.ok) {
        setMessage("");
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
        <h1 className="text-2xl font-semibold">推送管理</h1>
        <p className="text-sm text-neutral-600">向用户发送广播消息</p>
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
        {/* 发送表单 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            发送推送
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                目标用户
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTarget("all")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    target === "all"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  全部用户
                </button>
                <button
                  type="button"
                  onClick={() => setTarget("active")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    target === "active"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  活跃用户
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                消息内容
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="输入要推送的消息内容..."
                className="w-full px-3 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
              />
              <p className="mt-1 text-xs text-neutral-500">
                支持纯文本，{message.length}/4096 字符
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full px-4 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "发送中..." : "发送推送"}
            </button>
          </form>
        </div>

        {/* 预览 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4">消息预览</h2>
          <div className="bg-neutral-100 rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  CP
                </div>
                <div>
                  <div className="text-sm font-medium">CryptoPulse Bot</div>
                  <div className="text-xs text-neutral-500">刚刚</div>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">
                {message || "消息内容将显示在这里..."}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-neutral-600">
            <h3 className="font-medium text-neutral-900">推送说明</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>推送将发送给所有已绑定用户</li>
              <li>消息长度不能超过 4096 字符</li>
              <li>建议避免频繁推送，以免用户屏蔽</li>
              <li>可在消息中添加市场链接引导交易</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
