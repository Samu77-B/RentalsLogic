import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}
