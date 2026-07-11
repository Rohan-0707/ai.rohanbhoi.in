"use client";

import { useState, type ReactNode } from "react";
import { DashboardHeaderBar, type HeaderUser } from "@/components/dashboard/DashboardHeaderBar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { MobileSidebarDrawer } from "@/components/dashboard/MobileSidebarDrawer";

type DashboardShellProps = {
  user: HeaderUser;
  children: ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white lg:h-screen lg:overflow-hidden">
      <DashboardSidebar />

      <MobileSidebarDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] print:ml-0 print:pb-0 lg:ml-60 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:pb-0">
        <DashboardHeaderBar
          user={user}
          onMenuToggle={() => setMenuOpen((current) => !current)}
        />

        <main className="monsoon-scrollbar flex-1 overflow-x-hidden bg-slate-50 px-4 py-6 sm:px-6 print:bg-white print:p-0 lg:overflow-y-auto lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
