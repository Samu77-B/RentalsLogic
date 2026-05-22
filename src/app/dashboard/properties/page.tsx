import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyList } from "@/components/properties/property-list";

export default function PropertiesPage() {
  return (
    <DashboardShell>
      <PropertyList />
    </DashboardShell>
  );
}
