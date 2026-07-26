"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MaintenanceManager({
  tenantMode = false,
  propertyId: lockedPropertyId,
}: {
  tenantMode?: boolean;
  propertyId?: string;
}) {
  const { data: properties } = useSWR(
    lockedPropertyId || tenantMode ? (tenantMode ? "/api/tenant/dashboard" : null) : "/api/properties",
    fetcher
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState(lockedPropertyId ?? "");
  const propertyId = lockedPropertyId || selectedPropertyId;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    photoUrls: [] as string[],
  });

  const propertyList = tenantMode
    ? properties?.properties?.map((p: { id: string; address: string }) => p)
    : properties;

  const { data: requests, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/maintenance` : null,
    fetcher
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) return;
    await fetch(`/api/properties/${propertyId}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ title: "", description: "", priority: "MEDIUM", photoUrls: [] });
    mutate();
  }

  async function updateStatus(requestId: string, status: string) {
    await fetch(`/api/maintenance/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Maintenance</h2>
        <div className="flex items-center gap-3">
          {!lockedPropertyId && (
            <Select value={selectedPropertyId} onValueChange={(v) => setSelectedPropertyId(v ?? "")}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {propertyList?.map((p: { id: string; address: string }) => (
                  <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button disabled={!propertyId}><Plus className="mr-2 h-4 w-4" />New Request</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Maintenance Request</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v ?? "MEDIUM" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FileUpload label="Add photo" onUpload={(url) => setForm({ ...form, photoUrls: [...form.photoUrls, url] })} />
                <Button type="submit" className="w-full">Submit</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {requests?.map((req: {
        id: string;
        title: string;
        description: string;
        priority: string;
        status: string;
        createdAt: string;
      }) => (
        <Card key={req.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{req.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{req.priority}</Badge>
                <Badge>{req.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{req.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
            {!tenantMode && req.status === "OPEN" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => updateStatus(req.id, "IN_PROGRESS")}>Start</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, "COMPLETED")}>Complete</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
