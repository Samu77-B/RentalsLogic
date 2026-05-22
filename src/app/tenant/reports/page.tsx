"use client";

import useSWR from "swr";
import Link from "next/link";
import { TenantShell } from "@/components/layout/tenant-shell";
import { TenantOverview } from "@/components/tenant/tenant-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REPORT_TYPE_LABELS } from "@/lib/checklists";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function TenantReportsList() {
  const { data } = useSWR("/api/tenant/dashboard", fetcher);
  const propertyId = data?.properties?.[0]?.id;
  const { data: reports } = useSWR(
    propertyId ? `/api/properties/${propertyId}/inspections` : null,
    fetcher
  );

  const pending = reports?.filter((r: { status: string }) =>
    ["SENT", "TENANT_REVIEW"].includes(r.status)
  );

  return (
    <div className="space-y-4">
      {!pending?.length ? (
        <p className="text-muted-foreground">No reports pending review.</p>
      ) : (
        pending.map((report: { id: string; title: string; type: string; status: string }) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{report.title}</CardTitle>
                <Badge>{report.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{REPORT_TYPE_LABELS[report.type]}</p>
            </CardHeader>
            <CardContent>
              <Link href={`/tenant/reports/${report.id}`}>
                <Button>Review & sign</Button>
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function TenantReportsPage() {
  return (
    <TenantShell>
      <h2 className="mb-6 text-2xl font-bold">Reports</h2>
      <TenantReportsList />
    </TenantShell>
  );
}
