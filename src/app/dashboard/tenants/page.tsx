import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TenantsListPage } from "@/components/tenants/tenants-panel";

export default function TenantsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Tenants</h2>
          <p className="text-muted-foreground">
            All tenants across your properties. Add or edit tenants from each property&apos;s Tenants tab.
          </p>
        </div>
        <TenantsListPage />
      </div>
    </DashboardShell>
  );
}
