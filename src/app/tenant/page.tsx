import { TenantShell } from "@/components/layout/tenant-shell";
import { TenantOverview } from "@/components/tenant/tenant-overview";

export default function TenantHomePage() {
  return (
    <TenantShell>
      <TenantOverview />
    </TenantShell>
  );
}
