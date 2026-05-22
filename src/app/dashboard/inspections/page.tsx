import { DashboardShell } from "@/components/layout/dashboard-shell";
import { InspectionsManager } from "@/components/inspections/inspections-manager";

export default function InspectionsPage() {
  return (
    <DashboardShell>
      <InspectionsManager />
    </DashboardShell>
  );
}
