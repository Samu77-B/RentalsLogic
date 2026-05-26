"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";
import { swrFetcher, reloadSWR } from "@/lib/swr";

interface MeterReading {
  id: string;
  readingType: string;
  readingValue: string;
  readingDate: string;
}

interface Tenancy {
  id: string;
  tenantName: string;
  tenantEmail: string;
  status: string;
  inviteToken?: string | null;
  leaseStartDate: string;
  leaseEndDate: string;
}

interface Document {
  id: string;
  title: string;
  isSigned: boolean;
  storagePath: string;
}

export function MeterReadingsPanel({ propertyId }: { propertyId: string }) {
  const readingsUrl = `/api/properties/${propertyId}/meter-readings`;
  const { data: readings, mutate } = useSWR<MeterReading[]>(readingsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    readingType: "ELECTRIC",
    readingValue: "",
    readingDate: new Date().toISOString().split("T")[0],
    photoUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(readingsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, readingValue: parseFloat(form.readingValue) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save reading");

      setOpen(false);
      setForm({
        readingType: "ELECTRIC",
        readingValue: "",
        readingDate: new Date().toISOString().split("T")[0],
        photoUrl: "",
      });
      await reloadSWR(mutate, readingsUrl);
      toast.success("Reading saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save reading");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meter Readings</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Reading</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Record Meter Reading</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.readingType}
                  onValueChange={(v) => setForm({ ...form, readingType: v ?? "ELECTRIC" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                    <SelectItem value="GAS">Gas</SelectItem>
                    <SelectItem value="WATER">Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reading</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={form.readingValue}
                  onChange={(e) => setForm({ ...form, readingValue: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  required
                  value={form.readingDate}
                  onChange={(e) => setForm({ ...form, readingDate: e.target.value })}
                />
              </div>
              <FileUpload
                label="Meter photo"
                onUpload={(url) => setForm({ ...form, photoUrl: url })}
              />
              <Button type="submit" className="w-full">Save Reading</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {readings?.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <Badge variant="outline">{r.readingType}</Badge>
                <p className="mt-1 font-semibold">{r.readingValue}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(r.readingDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TenantsPanel({ propertyId }: { propertyId: string }) {
  const tenantsUrl = `/api/properties/${propertyId}/tenants`;
  const { data: tenants, mutate } = useSWR<Tenancy[]>(tenantsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    leaseStartDate: "",
    leaseEndDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(tenantsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite tenant");

      if (data.inviteUrl) {
        setLastInviteUrl(data.inviteUrl);
      }
      setOpen(false);
      setForm({
        tenantName: "",
        tenantEmail: "",
        tenantPhone: "",
        leaseStartDate: "",
        leaseEndDate: "",
      });
      await reloadSWR(mutate, tenantsUrl);
      toast.success("Tenant invited");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite tenant");
    }
  }

  function inviteLink(token?: string | null) {
    if (!token) return null;
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${base.replace(/\/$/, "")}/tenant/accept?token=${token}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tenants</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Invite Tenant</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Tenant</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input required value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" required value={form.tenantEmail} onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.tenantPhone} onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lease start</Label>
                  <Input type="date" required value={form.leaseStartDate} onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })} />
                </div>
                <div>
                  <Label>Lease end</Label>
                  <Input type="date" required value={form.leaseEndDate} onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full">Send Invite</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lastInviteUrl && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm font-medium">Tenant invite link (copy and send manually for testing)</p>
            <p className="mt-2 break-all text-xs text-muted-foreground">{lastInviteUrl}</p>
          </CardContent>
        </Card>
      )}

      {tenants?.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.tenantName}</CardTitle>
              <Badge>{t.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.tenantEmail}</p>
            <p className="mt-1 text-sm">
              {new Date(t.leaseStartDate).toLocaleDateString()} – {new Date(t.leaseEndDate).toLocaleDateString()}
            </p>
            {t.status === "PENDING" && t.inviteToken && (
              <p className="mt-2 break-all text-xs text-primary">
                Invite: {inviteLink(t.inviteToken)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DocumentsPanel({ propertyId }: { propertyId: string }) {
  const documentsUrl = `/api/properties/${propertyId}/documents`;
  const { data: documents, mutate } = useSWR<Document[]>(documentsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", documentType: "OTHER", storagePath: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(documentsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save document");

      setOpen(false);
      setForm({ title: "", documentType: "OTHER", storagePath: "" });
      await reloadSWR(mutate, documentsUrl);
      toast.success("Document saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save document");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Upload</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <FileUpload
                accept="application/pdf,image/*"
                label="Choose file"
                onUpload={(url) => setForm({ ...form, storagePath: url })}
              />
              <Button type="submit" className="w-full" disabled={!form.storagePath}>Save Document</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents?.map((d) => (
        <Card key={d.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{d.title}</p>
              <Badge variant={d.isSigned ? "default" : "secondary"} className="mt-1">
                {d.isSigned ? "Signed" : "Unsigned"}
              </Badge>
            </div>
            <a href={d.storagePath} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
              View
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
