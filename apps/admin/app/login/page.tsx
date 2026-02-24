import { loginAction } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const hasError = sp.error === "1";
  const hasAdminToken = Boolean(process.env.ADMIN_TOKEN);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">管理员登录</h1>
        <p className="text-neutral-600">请输入 ADMIN_TOKEN</p>
      </div>

      {!hasAdminToken ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          检测到未设置 ADMIN_TOKEN。开发环境下可直接访问 /admin；生产环境必须设置。
        </div>
      ) : null}

      {hasError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          登录失败：口令不正确
        </div>
      ) : null}

      <form action={loginAction} className="space-y-3">
        <Input name="token" type="password" placeholder="ADMIN_TOKEN" />
        <Button className="w-full" type="submit">
          登录
        </Button>
      </form>
    </main>
  );
}

