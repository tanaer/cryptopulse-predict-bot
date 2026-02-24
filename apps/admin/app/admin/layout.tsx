import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-semibold">
              CryptoPulse Admin
            </Link>
            <nav className="flex items-center gap-2 text-sm text-neutral-600">
              <Link href="/admin">概览</Link>
            </nav>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">返回</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

