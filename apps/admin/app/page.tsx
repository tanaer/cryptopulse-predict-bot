import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">CryptoPulse Admin</h1>
        <p className="text-neutral-600">
          单管理员后台：推送、用户、黑名单、统计、归因验证。
        </p>
      </div>
      <Button asChild>
        <Link href="/admin">进入后台</Link>
      </Button>
    </main>
  );
}

