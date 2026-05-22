import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BillingPanel } from "@/components/dashboard/billing-panel";

export default function BillingPage() {
  return (
    <DashboardShell>
      <BillingPanel />
    </DashboardShell>
  );
}
