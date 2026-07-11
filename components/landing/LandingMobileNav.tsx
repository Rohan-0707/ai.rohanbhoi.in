"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCloudRain,
  IconHome,
  IconShield,
} from "@/components/dashboard/CitizenIcons";

type LandingMobileNavProps = {
  loginHref: string;
};

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: IconHome,
    match: (path: string) => path === "/",
  },
  {
    href: "#how-it-works",
    label: "Steps",
    icon: IconShield,
    match: () => false,
  },
  {
    href: "/",
    label: "Start",
    icon: IconCloudRain,
    match: (path: string) =>
      path === "/" || path.startsWith("/login") || path.startsWith("/dashboard"),
  },
] as const;

export function LandingMobileNav({ loginHref }: LandingMobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-[15px] pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md lg:hidden">
      <div className="grid w-full grid-cols-3 gap-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const href = item.label === "Start" ? loginHref : item.href;
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.label}
              href={href}
              className={`monsoon-touch-target flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-teal-50 text-monsoon-secondary"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
