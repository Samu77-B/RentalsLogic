import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MaintenanceManager } from "@/components/maintenance/maintenance-manager";

export default function MaintenancePage() {
  return (
    <DashboardShell>
      <MaintenanceManager />
    </DashboardShell>
  );
}
