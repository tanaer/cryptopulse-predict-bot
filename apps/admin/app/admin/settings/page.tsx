import { prisma } from "@cryptopulse/db";
import { Shield, Key, Bot, Database } from "lucide-react";

export default function SettingsPage() {
  const envVars = [
    { key: "TELEGRAM_BOT_TOKEN", label: "Telegram Bot Token", status: process.env.TELEGRAM_BOT_TOKEN ? "已配置" : "未配置" },
    { key: "BOT_API_TOKEN", label: "Bot API Token", status: process.env.BOT_API_TOKEN ? "已配置" : "未配置" },
    { key: "ADMIN_TOKEN", label: "管理员 Token", status: process.env.ADMIN_TOKEN ? "已配置" : "未配置" },
    { key: "DATABASE_URL", label: "数据库连接", status: process.env.DATABASE_URL ? "已配置" : "未配置" },
    { key: "REDIS_URL", label: "Redis 连接", status: process.env.REDIS_URL ? "已配置" : "未配置" },
    { key: "POLY_BUILDER_API_KEY", label: "Builder API Key", status: process.env.POLY_BUILDER_API_KEY ? "已配置" : "未配置" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="text-sm text-neutral-600">查看系统配置状态</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 环境变量状态 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            环境变量配置
          </h2>
          <div className="space-y-3">
            {envVars.map((env) => (
              <div key={env.key} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-sm text-neutral-700">{env.label}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  env.status === "已配置" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {env.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 安全设置 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安全设置
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-neutral-600" />
                <span className="font-medium text-sm">管理员认证</span>
              </div>
              <p className="text-xs text-neutral-600 mb-3">
                当前使用 ADMIN_TOKEN 进行单管理员认证。建议定期更换 Token 以保证安全。
              </p>
              <p className="text-xs text-neutral-500">
                Token 长度: {process.env.ADMIN_TOKEN?.length || 0} 字符
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-neutral-600" />
                <span className="font-medium text-sm">Bot 配置</span>
              </div>
              <p className="text-xs text-neutral-600">
                Telegram Bot 用于与用户交互，发送通知和接收命令。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium mb-1">配置说明</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>环境变量需要在服务器上通过 .env 文件或系统环境变量配置</li>
          <li>修改环境变量后需要重启服务才能生效</li>
          <li>敏感信息（如 Token、Secret）请勿提交到代码仓库</li>
          <li>Builder API 凭据请妥善保管，不要泄露给他人</li>
        </ul>
      </div>
    </div>
  );
}
