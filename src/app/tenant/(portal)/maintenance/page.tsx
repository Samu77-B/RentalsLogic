import { TenantShell } from "@/components/layout/tenant-shell";
import { MaintenanceManager } from "@/components/maintenance/maintenance-manager";

export default function TenantMaintenancePage() {
  return (
    <TenantShell>
      <MaintenanceManager tenantMode />
    </TenantShell>
  );
}
