import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard";
import { getHeaderUser } from "@/lib/dashboard/get-header-user";

export default async function DashboardPage() {
  const user = await getHeaderUser();

  return <CitizenDashboard user={user} />;
}
