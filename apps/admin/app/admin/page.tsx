export default async function AdminHomePage() {
  let userCount: number | null = null;
  let bannedCount: number | null = null;

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@cryptopulse/db");
      userCount = await prisma.user.count();
      bannedCount = await prisma.user.count({ where: { isBanned: true } });
    } catch {
      userCount = null;
      bannedCount = null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">概览</h1>
        <p className="text-sm text-neutral-600">
          本 Bot 仅为交易工具，不构成投资建议。
        </p>
      </div>

      {userCount === null || bannedCount === null ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          数据库未连接或未配置（DATABASE_URL）。当前展示为占位信息。
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-neutral-600">用户数</div>
          <div className="mt-2 text-2xl font-semibold">{userCount ?? "-"}</div>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-neutral-600">黑名单用户</div>
          <div className="mt-2 text-2xl font-semibold">
            {bannedCount ?? "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

