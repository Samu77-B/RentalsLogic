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
import { CERTIFICATE_TYPE_LABELS } from "@/lib/checklists";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CertificatesManager() {
  const { data: properties } = useSWR("/api/properties", fetcher);
  const [propertyId, setPropertyId] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "GAS_SAFETY",
    issueDate: "",
    expiryDate: "",
    fileUrl: "",
    notes: "",
  });

  const { data: certs, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/certificates` : null,
    fetcher
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) return;
    await fetch(`/api/properties/${propertyId}/certificates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    mutate();
  }

  async function sendReminders() {
    await fetch("/api/dashboard", { method: "POST" });
    alert("Expiry reminders processed (check console if email not configured)");
  }

  function daysUntil(date: string) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <div className="flex items-center gap-3">
          <Select value={propertyId} onValueChange={(v) => setPropertyId(v ?? "")}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties?.map((p: { id: string; address: string }) => (
                <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={sendReminders}>Send expiry alerts</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button disabled={!propertyId}><Plus className="mr-2 h-4 w-4" />Add</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Certificate</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "GAS_SAFETY" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CERTIFICATE_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Issue date</Label>
                    <Input type="date" required value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Expiry date</Label>
                    <Input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                  </div>
                </div>
                <FileUpload accept="application/pdf,image/*" label="Upload certificate" onUpload={(url) => setForm({ ...form, fileUrl: url })} />
                <Button type="submit" className="w-full">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {propertyId && certs?.map((cert: {
        id: string;
        type: string;
        expiryDate: string;
        fileUrl?: string;
      }) => {
        const days = daysUntil(cert.expiryDate);
        return (
          <Card key={cert.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{CERTIFICATE_TYPE_LABELS[cert.type]}</CardTitle>
                <Badge variant={days <= 30 ? "destructive" : "secondary"}>
                  {days <= 0 ? "Expired" : `${days} days left`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
              </p>
              {cert.fileUrl && (
                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">
                  View document
                </a>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
