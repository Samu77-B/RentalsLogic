"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Plus, Building2, Loader2, Wrench } from "lucide-react";
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
import Image from "next/image";

interface PropertySummary {
  id: string;
  address: string;
  city?: string;
  postcode?: string;
  propertyType: string;
  rentAmount: string | number;
  rentPeriod?: string;
  coverPhotoUrl?: string | null;
  _count?: {
    rooms: number;
    tenancies: number;
    maintenanceRequests?: number;
  };
}

export function PropertyList() {
  const propertiesUrl = "/api/properties";
  const { data: properties, mutate, isLoading } = useSWR<PropertySummary[]>(
    propertiesUrl,
    swrFetcher
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    address: "",
    city: "",
    postcode: "",
    propertyType: "APARTMENT",
    rentAmount: "",
    rentPeriod: "MONTHLY",
    coverPhotoUrl: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const rentAmount = parseFloat(form.rentAmount);
    if (Number.isNaN(rentAmount)) {
      setError("Please enter a valid rent amount.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rentAmount,
          coverPhotoUrl: form.coverPhotoUrl || null,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create property");
      }

      setOpen(false);
      setForm({
        address: "",
        city: "",
        postcode: "",
        propertyType: "APARTMENT",
        rentAmount: "",
        rentPeriod: "MONTHLY",
        coverPhotoUrl: "",
      });
      await reloadSWR(mutate, propertiesUrl);
      toast.success("Property created");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create property";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-muted-foreground">Loading properties...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Properties</h2>
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setError(null); }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Property</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.propertyType}
                    onValueChange={(v) => setForm({ ...form, propertyType: v ?? "APARTMENT" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROOM">Room</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="HOUSE">House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rent">Rent (£)</Label>
                  <Input
                    id="rent"
                    type="number"
                    required
                    value={form.rentAmount}
                    onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Property photo</Label>
                <FileUpload
                  label="Upload photo"
                  onUpload={(url) => setForm((prev) => ({ ...prev, coverPhotoUrl: url }))}
                />
                {form.coverPhotoUrl && (
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border">
                    <Image
                      src={form.coverPhotoUrl}
                      alt="Property preview"
                      fill
                      className="object-cover"
                      unoptimized={form.coverPhotoUrl.startsWith("data:")}
                    />
                  </div>
                )}
              </div>
              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Property"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!properties?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No properties yet. Add your first property.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const openJobs = property._count?.maintenanceRequests ?? 0;
            const needsWork = openJobs > 0;

            return (
              <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  {property.coverPhotoUrl ? (
                    <div className="relative h-40 w-full bg-muted">
                      <Image
                        src={property.coverPhotoUrl}
                        alt={property.address}
                        fill
                        className="object-cover"
                        unoptimized={property.coverPhotoUrl.startsWith("data:")}
                      />
                    </div>
                  ) : null}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{property.address}</CardTitle>
                      <Badge variant="secondary">{property.propertyType}</Badge>
                    </div>
                    {property.city && (
                      <p className="text-sm text-muted-foreground">{property.city}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-semibold">
                      £{property.rentAmount}/{property.rentPeriod?.toLowerCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {property._count?.rooms ?? 0} rooms · {property._count?.tenancies ?? 0}{" "}
                      tenants
                    </p>
                    {needsWork && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-2.5 py-1 text-xs font-medium text-white">
                        <Wrench className="size-3.5" strokeWidth={2} />
                        {openJobs === 1
                          ? "1 open maintenance job"
                          : `${openJobs} open maintenance jobs`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
