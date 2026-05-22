"use client";

import useSWR from "swr";
import Image from "next/image";
import { REPORT_TYPE_LABELS, CONDITION_OPTIONS } from "@/lib/checklists";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ReportViewer({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useSWR(`/api/inspections/${reportId}`, fetcher);

  if (isLoading) return <p>Loading report...</p>;
  if (!report) return <p>Report not found</p>;

  const compareSections = report.compareReport?.sections ?? [];

  function getCompareItem(itemName: string, sectionTitle: string) {
    const section = compareSections.find((s: { title: string }) => s.title === sectionTitle);
    return section?.items?.find((i: { name: string }) => i.name === itemName);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 print:max-w-none">
      <div className="flex items-start justify-between print:block">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-muted-foreground">
            {REPORT_TYPE_LABELS[report.type]} · {report.property?.address}
          </p>
        </div>
        <Badge className="print:hidden">{report.status}</Badge>
      </div>

      {report.type === "CHECK_OUT" && report.compareReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Side-by-side comparison</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.sections?.flatMap((section: {
                  title: string;
                  items: Array<{ name: string; condition?: string }>;
                }) =>
                  section.items.map((item) => {
                    const compare = getCompareItem(item.name, section.title);
                    return (
                      <TableRow key={`${section.title}-${item.name}`}>
                        <TableCell>{section.title} — {item.name}</TableCell>
                        <TableCell>{compare?.condition ?? "—"}</TableCell>
                        <TableCell>{item.condition ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {report.sections?.map((section: {
        id: string;
        title: string;
        items: Array<{
          id: string;
          name: string;
          condition?: string;
          cleanliness?: string;
          notes?: string;
          photoUrls: string[];
          tenantComments?: Array<{ comment: string; user: { fullName?: string } }>;
        }>;
      }) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Condition: {item.condition} · Cleanliness: {item.cleanliness}
                    </p>
                    {item.notes && <p className="mt-1 text-sm">{item.notes}</p>}
                  </div>
                </div>
                {item.photoUrls?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.photoUrls.map((url, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded">
                        <Image src={url} alt={item.name} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {item.tenantComments?.map((c, i) => (
                  <div key={i} className="mt-2 rounded bg-muted p-2 text-sm">
                    <strong>{c.user.fullName ?? "Tenant"}:</strong> {c.comment}
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {report.checklistData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance checklist</CardTitle>
          </CardHeader>
          <CardContent>
            {(report.checklistData as { sections: Array<{ title: string; items: string[] }> }).sections?.map(
              (section) => (
                <div key={section.title} className="mb-4">
                  <p className="font-medium">{section.title}</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      <button
        type="button"
        className="hidden print:block"
        onClick={() => window.print()}
      />
    </div>
  );
}
