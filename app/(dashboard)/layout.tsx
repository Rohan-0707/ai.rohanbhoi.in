import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getHeaderUser } from "@/lib/dashboard/get-header-user";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { JuryAlertBanner } from "@/components/ui/JuryAlertBanner";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getHeaderUser();

  return (
    <SocketProvider>
      <div className="print:hidden">
        <JuryAlertBanner />
      </div>
      <DashboardShell user={user}>{children}</DashboardShell>
    </SocketProvider>
  );
}
