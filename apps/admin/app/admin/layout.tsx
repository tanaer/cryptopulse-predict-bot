import Link from "next/link";
import { LayoutDashboard, Users, Bell, BarChart3, Settings, LogOut, TrendingUp } from "lucide-react";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/push", label: "推送管理", icon: Bell },
  { href: "/admin/copy-trade", label: "复制交易", icon: TrendingUp },
  { href: "/admin/stats", label: "交易统计", icon: BarChart3 },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white border-r border-neutral-200">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-lg font-semibold">CryptoPulse Admin</h1>
          <p className="text-xs text-neutral-500">管理员后台</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </form>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
