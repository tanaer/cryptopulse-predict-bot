import { prisma } from "@cryptopulse/db";
import { Ban, CheckCircle, Search } from "lucide-react";
import Link from "next/link";

async function getUsers(search?: string, onlyBanned?: boolean) {
  const where: Record<string, unknown> = {};
  
  if (search) {
    where.OR = [
      { telegramId: { equals: BigInt(search).valueOf() } },
      { polymarketAddress: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (onlyBanned) {
    where.isBanned = true;
  }

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: {
        select: { tradeOrders: true }
      }
    }
  });
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; banned?: string };
}) {
  const search = searchParams.q;
  const onlyBanned = searchParams.banned === "true";
  
  let users: Awaited<ReturnType<typeof getUsers>> = [];
  let error: string | null = null;
  
  try {
    users = await getUsers(search, onlyBanned);
  } catch (e) {
    error = "数据库连接失败，请检查 DATABASE_URL 配置";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">用户管理</h1>
          <p className="text-sm text-neutral-600">查看和管理所有绑定用户</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className={`px-3 py-1.5 text-sm rounded-md ${!onlyBanned ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"}`}
          >
            全部用户
          </Link>
          <Link
            href="/admin/users?banned=true"
            className={`px-3 py-1.5 text-sm rounded-md ${onlyBanned ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-700"}`}
          >
            黑名单
          </Link>
        </div>
      </div>

      {/* 搜索 */}
      <form className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            name="q"
            placeholder="搜索 Telegram ID 或钱包地址..."
            defaultValue={search}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800"
        >
          搜索
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {/* 用户列表 */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Telegram ID</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">钱包地址</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">订单数</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">注册时间</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">状态</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  暂无用户数据
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono">{user.telegramId.toString()}</td>
                  <td className="px-4 py-3 font-mono text-xs max-w-xs truncate">
                    {user.polymarketAddress || "-"}
                  </td>
                  <td className="px-4 py-3">{user._count.tradeOrders}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <Ban className="w-3 h-3" />
                        已封禁
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action="/api/admin/toggle-ban" method="POST" className="inline">
                      <input type="hidden" name="telegramId" value={user.telegramId.toString()} />
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded ${
                          user.isBanned
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.isBanned ? "解封" : "封禁"}
                      </button>
                    </form>
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
