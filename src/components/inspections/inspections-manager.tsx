"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_TYPE_LABELS } from "@/lib/checklists";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InspectionsManager() {
  const { data: properties } = useSWR("/api/properties", fetcher);
  const [propertyId, setPropertyId] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "CHECK_IN",
    title: "",
    compareReportId: "",
  });

  const { data: reports, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/inspections` : null,
    fetcher
  );

  async function createReport(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) return;
    await fetch(`/api/properties/${propertyId}/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        title: form.title || undefined,
        compareReportId: form.compareReportId || undefined,
      }),
    });
    setOpen(false);
    mutate();
  }

  async function sendReport(reportId: string) {
    await fetch(`/api/inspections/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT" }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Inspection Reports</h2>
        <div className="flex items-center gap-3">
          <Select value={propertyId} onValueChange={(v) => setPropertyId(v ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties?.map((p: { id: string; address: string }) => (
                <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button disabled={!propertyId}><Plus className="mr-2 h-4 w-4" />New Report</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Create Inspection Report</DialogTitle></DialogHeader>
              <form onSubmit={createReport} className="space-y-4">
                <div>
                  <Label>Report type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v ?? "CHECK_IN" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.type === "CHECK_OUT" && reports?.length > 0 && (
                  <div>
                    <Label>Compare to (check-in)</Label>
                    <Select
                      value={form.compareReportId}
                      onValueChange={(v) => setForm({ ...form, compareReportId: v ?? "" })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select report" /></SelectTrigger>
                      <SelectContent>
                        {reports
                          .filter((r: { type: string }) => r.type === "CHECK_IN")
                          .map((r: { id: string; title: string }) => (
                            <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full">Generate from inventory</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!propertyId ? (
        <p className="text-muted-foreground">Select a property to view reports.</p>
      ) : !reports?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No reports yet for this property.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report: {
            id: string;
            title: string;
            type: string;
            status: string;
            createdAt: string;
          }) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {REPORT_TYPE_LABELS[report.type]} · {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/reports/${report.id}`} />}>
                  View / Export
                </Button>
                {report.status === "DRAFT" && (
                  <Button size="sm" onClick={() => sendReport(report.id)}>
                    <Send className="mr-1 h-3 w-3" /> Send to tenant
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
