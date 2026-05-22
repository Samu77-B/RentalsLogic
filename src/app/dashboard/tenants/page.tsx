import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyList } from "@/components/properties/property-list";

export default function TenantsPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tenants</h2>
        <p className="text-muted-foreground">
          Manage tenants from each property&apos;s detail page, or select a property below.
        </p>
        <PropertyList />
      </div>
    </DashboardShell>
  );
}
