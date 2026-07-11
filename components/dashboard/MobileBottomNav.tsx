"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITIZEN_NAV, isNavActive } from "@/lib/dashboard/nav";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden">
      <div className="grid w-full grid-cols-4 gap-1">
        {CITIZEN_NAV.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`monsoon-touch-target flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-teal-50 text-monsoon-secondary"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[11px] font-medium">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
