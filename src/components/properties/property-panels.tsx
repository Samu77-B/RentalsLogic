"use client";

import { useState } from "react";
import useSWR from "swr";
import { Camera, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface Document {
  id: string;
  title: string;
  isSigned: boolean;
  storagePath: string;
}

interface MeterScanResult {
  readingType: "ELECTRIC" | "GAS" | "WATER";
  readingValue: number;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

const emptyReadingForm = () => ({
  readingType: "ELECTRIC",
  readingValue: "",
  readingDate: new Date().toISOString().split("T")[0],
  photoUrl: "",
});

export function MeterReadingsPanel({ propertyId }: { propertyId: string }) {
  const readingsUrl = `/api/properties/${propertyId}/meter-readings`;
  const { data: readings, mutate } = useSWR<MeterReading[]>(readingsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState(emptyReadingForm);

  async function scanMeterPhoto(imageUrl: string) {
    setScanning(true);
    try {
      const res = await fetch("/api/meters/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as MeterScanResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not scan meter photo");
      }

      setForm((prev) => ({
        ...prev,
        photoUrl: imageUrl,
        readingType: data.readingType || prev.readingType,
        readingValue:
          typeof data.readingValue === "number"
            ? String(data.readingValue)
            : prev.readingValue,
      }));

      const confidenceNote =
        data.confidence === "low"
          ? " Low confidence — please double-check."
          : "";
      toast.success(
        `Detected ${data.readingType.toLowerCase()} reading ${data.readingValue}.${confidenceNote}`
      );
    } catch (err) {
      setForm((prev) => ({ ...prev, photoUrl: imageUrl }));
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not scan this photo. Enter the reading manually."
      );
    } finally {
      setScanning(false);
    }
  }

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
      setForm(emptyReadingForm());
      await reloadSWR(mutate, readingsUrl);
      toast.success("Reading saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save reading");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Meter Readings</h2>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setForm(emptyReadingForm());
              setScanning(false);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Reading
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Meter Reading</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="text-sm font-medium text-foreground">Scan meter</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Take or upload a photo — we&apos;ll detect the meter type and reading.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <FileUpload
                    capture
                    label="Scan meter photo"
                    onUpload={scanMeterPhoto}
                  />
                  {scanning && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Reading numbers…
                    </span>
                  )}
                  {form.photoUrl && !scanning && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground">
                      <Camera className="size-3.5" />
                      Photo attached
                    </span>
                  )}
                </div>
              </div>
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
              <Button type="submit" className="w-full" disabled={scanning}>
                Save Reading
              </Button>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </Button>
            }
          />
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
