import Link from "next/link";
import { ReportViewer } from "@/components/inspections/report-viewer";
import { PrintButton } from "@/components/inspections/print-button";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ reportId: string }> };

export default async function ReportPage({ params }: Props) {
  const { reportId } = await params;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex justify-between print:hidden">
        <Link href="/dashboard/inspections">
          <Button variant="outline">Back</Button>
        </Link>
        <PrintButton />
      </div>
      <ReportViewer reportId={reportId} />
    </div>
  );
}
