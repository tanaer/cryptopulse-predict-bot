import { prisma } from "@cryptopulse/db";
import { TrendingUp, Users, ShoppingCart, CheckCircle, Award } from "lucide-react";

async function getStats() {
  const [
    totalUsers,
    totalOrders,
    completedOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.tradeOrder.count(),
    prisma.tradeOrder.count({ where: { status: "COMPLETED" } }),
    prisma.tradeOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { telegramId: true } } },
    }),
  ]);

  return {
    totalUsers,
    totalOrders,
    completedOrders,
    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
    recentOrders,
  };
}

export default async function StatsPage() {
  let stats: Awaited<ReturnType<typeof getStats>> | null = null;
  let error: string | null = null;

  try {
    stats = await getStats();
  } catch (e) {
    error = "数据库连接失败，请检查 DATABASE_URL 配置";
  }

  const statCards = [
    {
      title: "总用户数",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "总订单数",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "成交订单",
      value: stats?.completedOrders ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "成交率",
      value: `${stats?.completionRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Builder 配置状态
  const builderConfigured = process.env.POLY_BUILDER_API_KEY && 
                           process.env.POLY_BUILDER_SECRET && 
                           process.env.POLY_BUILDER_PASSPHRASE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">交易统计</h1>
        <p className="text-sm text-neutral-600">查看平台运营数据</p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-sm text-neutral-600">{card.title}</div>
                <div className="text-2xl font-semibold">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Builder 归因状态 */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Builder 归因验证
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">Builder 配置</div>
            <div className={`text-lg font-semibold ${builderConfigured ? "text-green-600" : "text-amber-600"}`}>
              {builderConfigured ? "已配置" : "未配置"}
            </div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">签名端点</div>
            <div className="text-lg font-semibold text-blue-600">
              /api/polymarket/sign
            </div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600 mb-1">归因状态</div>
            <div className="text-lg font-semibold text-neutral-900">
              待验证
            </div>
          </div>
        </div>
        {!builderConfigured && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
            请在环境变量中配置 POLY_BUILDER_API_KEY、POLY_BUILDER_SECRET 和 POLY_BUILDER_PASSPHRASE 以启用 Builder 归因
          </div>
        )}
      </div>

      {/* 最近订单 */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-medium">最近订单</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">时间</th>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">用户</th>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">市场</th>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">方向</th>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">金额</th>
              <th className="px-4 py-2 text-left font-medium text-neutral-600">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {!stats?.recentOrders.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  暂无订单数据
                </td>
              </tr>
            ) : (
              stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 text-neutral-600">
                    {new Date(order.createdAt).toLocaleString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {order.user.telegramId.toString()}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs max-w-xs truncate">
                    {order.marketId}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        order.side === "BUY"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.side === "BUY" ? "买入" : "卖出"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{order.amount} USDC</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status === "COMPLETED"
                        ? "已完成"
                        : order.status === "PENDING"
                        ? "处理中"
                        : "失败"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
