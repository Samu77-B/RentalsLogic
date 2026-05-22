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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/shared/file-upload";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MeterReadingsPanel({ propertyId }: { propertyId: string }) {
  const { data: readings, mutate } = useSWR(
    `/api/properties/${propertyId}/meter-readings`,
    fetcher
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    readingType: "ELECTRIC",
    readingValue: "",
    readingDate: new Date().toISOString().split("T")[0],
    photoUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/properties/${propertyId}/meter-readings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, readingValue: parseFloat(form.readingValue) }),
    });
    setOpen(false);
    mutate();
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
        {readings?.map((r: {
          id: string;
          readingType: string;
          readingValue: string;
          readingDate: string;
        }) => (
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
  const { data: tenants, mutate } = useSWR(
    `/api/properties/${propertyId}/tenants`,
    fetcher
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    leaseStartDate: "",
    leaseEndDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/properties/${propertyId}/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    mutate();
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

      {tenants?.map((t: {
        id: string;
        tenantName: string;
        tenantEmail: string;
        status: string;
        leaseStartDate: string;
        leaseEndDate: string;
      }) => (
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DocumentsPanel({ propertyId }: { propertyId: string }) {
  const { data: documents, mutate } = useSWR(
    `/api/properties/${propertyId}/documents`,
    fetcher
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", documentType: "OTHER", storagePath: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/properties/${propertyId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    mutate();
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

      {documents?.map((d: { id: string; title: string; isSigned: boolean; storagePath: string }) => (
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
