import { TenantShell } from "@/components/layout/tenant-shell";
import { TenantReportReview } from "@/components/inspections/tenant-report-review";

type Props = { params: Promise<{ reportId: string }> };

export default async function TenantReportPage({ params }: Props) {
  const { reportId } = await params;

  return (
    <TenantShell>
      <TenantReportReview reportId={reportId} />
    </TenantShell>
  );
}
