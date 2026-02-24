import { confirmBindAction } from "./actions";
import { BindConfirmForm } from "./bind-confirm-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@cryptopulse/db";
import Link from "next/link";

function errorText(error?: string) {
  switch (error) {
    case "invalid_input":
      return "输入不合法：地址需为 0x 开头的 40 位十六进制（可留空）。";
    case "database_unavailable":
      return "数据库未配置（DATABASE_URL）。";
    case "prisma_unavailable":
      return "Prisma 未就绪，请先执行 prisma generate。";
    case "code_not_found":
      return "绑定码不存在，请检查链接是否完整。";
    case "code_used":
      return "绑定码已使用，请重新生成。";
    case "code_expired":
      return "绑定码已过期，请回到 Bot 重新生成。";
    case "server_error":
      return "服务器错误，请稍后重试。";
    default:
      return error;
  }
}

export default async function BindPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code.trim() : "";
  let error = typeof sp.error === "string" ? sp.error : undefined;

  let initialData = undefined;
  
  if (code && !error && process.env.DATABASE_URL) {
    try {
      const bindCode = await prisma.bindCode.findUnique({
        where: { code },
        include: { user: true }
      });
      
      const now = new Date();
      if (!bindCode) {
        error = "code_not_found";
      } else if (bindCode.usedAt) {
        error = "code_used";
      } else if (bindCode.expiresAt <= now) {
        error = "code_expired";
      } else if (bindCode.user) {
         initialData = {
             polymarketAddress: bindCode.user.polymarketAddress ?? "",
             safeAddress: bindCode.user.safeAddress ?? "",
             funderAddress: bindCode.user.funderAddress ?? ""
         };
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
      error = "server_error";
    }
  }

  const msg = errorText(error);

  const showForm = code && !error;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">绑定 Polymarket</h1>
        <p className="text-sm text-neutral-600">
          CryptoPulse Predict Bot 绑定页
        </p>
      </div>

      {msg ? (
        <div className="space-y-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {msg}
            </div>
            <Button asChild variant="outline" className="w-full">
                <Link href={process.env.NEXT_PUBLIC_BOT_USERNAME ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}` : "https://t.me/"}>
                    回到 Telegram
                </Link>
            </Button>
        </div>
      ) : null}

      {!code ? (
        <div className="space-y-4">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            <div className="font-medium">操作步骤</div>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>回到 Telegram，向 Bot 发送 /bind 生成绑定码</li>
              <li>打开 Bot 发回的链接（已带入绑定码）</li>
              <li>如手动输入绑定码，再点击“继续”</li>
            </ol>
          </div>

          <form action="/bind" method="get" className="space-y-3">
            <Input name="code" placeholder="请输入绑定码（例如：ABCD1234EF）" />
            <Button className="w-full" type="submit">
              继续
            </Button>
          </form>
          
          <div className="pt-4 text-center">
             <Button asChild variant="link" className="text-neutral-500">
                <Link href={process.env.NEXT_PUBLIC_BOT_USERNAME ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}` : "https://t.me/"}>
                    回到 Telegram
                </Link>
             </Button>
          </div>
        </div>
      ) : showForm ? (
        <BindConfirmForm code={code} action={confirmBindAction} initialData={initialData} />
      ) : null}
    </main>
  );
}

