"use client";

import { usePathname } from "next/navigation";
import { IconCloudRain, IconLocation } from "@/components/dashboard/CitizenIcons";
import { getGreetingName, getTimeGreeting } from "@/lib/dashboard/greeting";
import { CITIZEN_NAV } from "@/lib/dashboard/nav";

export type HeaderUser = {
  displayName: string;
  initials: string;
  location: string | null;
};

type DashboardHeaderBarProps = {
  user: HeaderUser;
  onMenuToggle?: () => void;
};

export function DashboardHeaderBar({
  user,
  onMenuToggle,
}: DashboardHeaderBarProps) {
  const pathname = usePathname();
  const firstName = getGreetingName(user.displayName);
  const timeGreeting = getTimeGreeting();
  const activePage = CITIZEN_NAV.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="z-30 shrink-0 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/80 shadow-sm print:hidden lg:sticky lg:top-0">
      <div className="flex min-h-[3.75rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="monsoon-touch-target rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm transition hover:text-monsoon-primary lg:hidden"
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-monsoon-secondary shadow-sm">
              <IconCloudRain className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-monsoon-primary">
                JalVayu AI
              </p>
              <p className="truncate text-sm text-slate-500">
                {timeGreeting}, {firstName}
              </p>
            </div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-lg font-semibold text-monsoon-primary">
              {timeGreeting}, {firstName}
            </p>
            <p className="truncate text-sm text-slate-500">
              {activePage && activePage.href !== "/dashboard"
                ? activePage.label
                : user.location
                  ? `Prepared for ${user.location}`
                  : "Your monsoon readiness hub"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user.location && (
            <div className="hidden max-w-[10rem] items-center gap-1.5 truncate rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm md:flex">
              <IconLocation className="h-3.5 w-3.5 shrink-0 text-monsoon-secondary" />
              <span className="truncate">{user.location}</span>
            </div>
          )}

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-monsoon-secondary text-sm font-semibold text-white shadow-sm"
            title={user.displayName}
          >
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
