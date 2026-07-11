"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconCloudRain, IconLogout } from "@/components/dashboard/CitizenIcons";
import { CITIZEN_NAV, isNavActive } from "@/lib/dashboard/nav";
import { SecurityBadge } from "@/components/ui/SecurityBadge";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-60 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
      <div className="px-5 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary">
            <IconCloudRain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-monsoon-primary">JalVayu AI</p>
            <p className="text-xs text-slate-500">Monsoon preparedness</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {CITIZEN_NAV.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-teal-50 text-monsoon-secondary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-monsoon-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex justify-center px-1">
          <SecurityBadge compact className="w-full justify-center" />
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-monsoon-primary"
        >
          <IconLogout className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
