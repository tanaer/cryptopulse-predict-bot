import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BindSuccessPage() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "";
  const botLink = botUsername ? `https://t.me/${botUsername}` : "https://t.me/";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">绑定成功</h1>
        <p className="text-sm text-neutral-600">
          现在可以回到 Telegram 继续使用 Bot（建议发送 /start 刷新菜单）。
        </p>
      </div>
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
        <div className="font-medium">下一步</div>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>回到 Telegram 打开与 Bot 的对话</li>
          <li>发送 /start 或 /bind</li>
        </ol>
      </div>
      <Button asChild className="w-full">
        <Link href={botLink} target="_blank" rel="noopener noreferrer">
            {botUsername ? `回到 @${botUsername}` : "回到 Telegram"}
        </Link>
      </Button>
      <div className="text-center">
        <Button asChild variant="link" className="text-neutral-500">
            <Link href="/">返回首页</Link>
        </Button>
      </div>
    </main>
  );
}

