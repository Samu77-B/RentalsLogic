import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CertificatesManager } from "@/components/maintenance/certificates-manager";

export default function CertificatesPage() {
  return (
    <DashboardShell>
      <CertificatesManager />
    </DashboardShell>
  );
}
