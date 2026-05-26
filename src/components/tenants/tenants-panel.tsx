"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, X, User } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/shared/file-upload";
import { swrFetcher, reloadSWR } from "@/lib/swr";
import {
  EMPLOYMENT_STATUSES,
  ID_DOCUMENT_TYPES,
  emptyGuarantor,
  emptyTenantForm,
  leaseStatus,
  tenancyToForm,
  type TenantFormState,
  type TenancyFormSource,
} from "@/lib/tenant-options";

type TenancyRecord = TenancyFormSource & {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string | null;
  status: string;
  inviteToken?: string | null;
  leaseStartDate: string;
  leaseEndDate: string;
  photoUrl?: string | null;
  documents?: Array<{ id: string; title: string; isSigned: boolean; storagePath: string }>;
  property?: { id: string; address: string };
}

function inviteLink(token?: string | null) {
  if (!token) return null;
  const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  return `${base.replace(/\/$/, "")}/tenant/accept?token=${token}`;
}

function TenantFormFields({
  form,
  setForm,
  showLeaseUpload,
}: {
  form: TenantFormState;
  setForm: React.Dispatch<React.SetStateAction<TenantFormState>>;
  showLeaseUpload?: boolean;
}) {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="id">ID & refs</TabsTrigger>
        <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
        <TabsTrigger value="lease">Lease</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Full name</Label>
            <Input
              required
              value={form.tenantName}
              onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={form.tenantEmail}
              onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })}
            />
          </div>
          <div>
            <Label>Mobile number</Label>
            <Input
              value={form.tenantPhone}
              onChange={(e) => setForm({ ...form, tenantPhone: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Previous address</Label>
            <Textarea
              value={form.previousAddress}
              onChange={(e) => setForm({ ...form, previousAddress: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
          <div>
            <Label>Nationality</Label>
            <Input
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
          </div>
          <div>
            <Label>Employment status</Label>
            <Select
              value={form.employmentStatus}
              onValueChange={(v) => setForm({ ...form, employmentStatus: v ?? "EMPLOYED" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Employer</Label>
            <Input
              value={form.employer}
              onChange={(e) => setForm({ ...form, employer: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Tenant photo</Label>
            <div className="mt-2 flex items-center gap-3">
              {form.photoUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                  <Image src={form.photoUrl} alt="" fill className="object-cover" unoptimized={form.photoUrl.startsWith("data:")} />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <FileUpload
                label="Upload photo"
                onUpload={(url) => setForm((prev) => ({ ...prev, photoUrl: url }))}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="id" className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>ID document type</Label>
            <Select
              value={form.idDocumentType}
              onValueChange={(v) => setForm({ ...form, idDocumentType: v ?? "PASSPORT" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ID_DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ID / passport number</Label>
            <Input
              value={form.idDocumentNumber}
              onChange={(e) => setForm({ ...form, idDocumentNumber: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>ID document scan</Label>
            <FileUpload
              accept="image/*,application/pdf"
              label="Upload ID"
              onUpload={(url) => setForm((prev) => ({ ...prev, idDocumentUrl: url }))}
            />
            {form.idDocumentUrl && (
              <a href={form.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-primary hover:underline">
                View uploaded ID
              </a>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label>Right to rent reference (UK)</Label>
            <Input
              value={form.rightToRentReference}
              onChange={(e) => setForm({ ...form, rightToRentReference: e.target.value })}
              placeholder="Share code or check reference"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Previous landlord reference</Label>
            <Textarea
              value={form.previousLandlordRef}
              onChange={(e) => setForm({ ...form, previousLandlordRef: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="mb-3 text-sm font-medium">Emergency contact</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input
                value={form.emergencyContactRelation}
                onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Any additional information about this tenant"
          />
        </div>
      </TabsContent>

      <TabsContent value="guarantors" className="mt-4 space-y-4">
        {form.guarantors.map((g, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Guarantor {index + 1}</p>
              {form.guarantors.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      ...form,
                      guarantors: form.guarantors.filter((_, i) => i !== index),
                    })
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full name</Label>
                <Input
                  value={g.fullName}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, fullName: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={g.address}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, address: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                  rows={2}
                />
              </div>
              <div>
                <Label>Occupation</Label>
                <Input
                  value={g.occupation}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, occupation: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                />
              </div>
              <div>
                <Label>Employer</Label>
                <Input
                  value={g.employer}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, employer: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={g.email}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, email: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={g.phone}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, phone: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Relationship to tenant</Label>
                <Input
                  value={g.relationship}
                  onChange={(e) => {
                    const guarantors = [...form.guarantors];
                    guarantors[index] = { ...g, relationship: e.target.value };
                    setForm({ ...form, guarantors });
                  }}
                  placeholder="e.g. Parent, Employer"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setForm({ ...form, guarantors: [...form.guarantors, emptyGuarantor()] })}
        >
          <Plus className="mr-2 h-4 w-4" />Add guarantor
        </Button>
      </TabsContent>

      <TabsContent value="lease" className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Lease start</Label>
            <Input
              type="date"
              required
              value={form.leaseStartDate}
              onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Lease end</Label>
            <Input
              type="date"
              required
              value={form.leaseEndDate}
              onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })}
            />
          </div>
        </div>
        {showLeaseUpload && (
          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <p className="text-sm font-medium">Tenancy agreement (AST)</p>
            <p className="text-xs text-muted-foreground">
              Upload the contract PDF. The tenant can e-sign it in their portal. Signatures are stored with a timestamp and IP address.
            </p>
            <div>
              <Label>Contract title</Label>
              <Input
                value={form.leaseContractTitle}
                onChange={(e) => setForm({ ...form, leaseContractTitle: e.target.value })}
              />
            </div>
            <FileUpload
              accept="application/pdf,image/*"
              label="Upload contract"
              onUpload={(url) => setForm((prev) => ({ ...prev, leaseContractUrl: url }))}
            />
            {form.leaseContractUrl && (
              <p className="text-sm text-muted-foreground">Contract ready to attach on save</p>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export function TenantsPanel({ propertyId }: { propertyId: string }) {
  const tenantsUrl = `/api/properties/${propertyId}/tenants`;
  const { data: tenants, mutate } = useSWR<TenancyRecord[]>(tenantsUrl, swrFetcher);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTenantForm());

  function openEdit(tenant: TenancyRecord) {
    setForm(tenancyToForm(tenant));
    setEditId(tenant.id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        guarantors: form.guarantors.filter((g) => g.fullName.trim()),
        ...(form.leaseContractUrl
          ? { leaseContractUrl: form.leaseContractUrl, leaseContractTitle: form.leaseContractTitle }
          : {}),
      };
      const res = await fetch(tenantsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add tenant");

      if (data.inviteUrl) setLastInviteUrl(data.inviteUrl);
      setAddOpen(false);
      setForm(emptyTenantForm());
      await reloadSWR(mutate, tenantsUrl);
      toast.success("Tenant added and invite created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add tenant");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        guarantors: form.guarantors.filter((g) => g.fullName.trim()),
        ...(form.leaseContractUrl
          ? { leaseContractUrl: form.leaseContractUrl, leaseContractTitle: form.leaseContractTitle }
          : {}),
      };
      const res = await fetch(`/api/tenancies/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update tenant");

      setEditId(null);
      setForm(emptyTenantForm());
      await reloadSWR(mutate, tenantsUrl);
      toast.success("Tenant updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update tenant");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTenant(id: string, name: string) {
    if (!confirm(`Remove tenant "${name}"?`)) return;
    try {
      const res = await fetch(`/api/tenancies/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete tenant");
      }
      await reloadSWR(mutate, tenantsUrl);
      toast.success("Tenant removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tenant");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tenants</h2>
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm(emptyTenantForm()); }}>
          <DialogTrigger render={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Tenant</Button>} />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>Add tenant</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <TenantFormFields form={form} setForm={setForm} showLeaseUpload />
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save & send invite"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lastInviteUrl && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm font-medium">Tenant invite link</p>
            <p className="mt-2 break-all text-xs text-muted-foreground">{lastInviteUrl}</p>
          </CardContent>
        </Card>
      )}

      {!tenants?.length ? (
        <p className="text-sm text-muted-foreground">No tenants yet. Add a tenant to record their details and send a portal invite.</p>
      ) : (
        tenants.map((t) => {
          const contract = leaseStatus(t);
          const lease = t.documents?.[0];
          return (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {t.photoUrl ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                        <Image src={t.photoUrl} alt="" fill className="object-cover" unoptimized={t.photoUrl.startsWith("data:")} />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{t.tenantName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t.tenantEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge>{t.status}</Badge>
                    <Badge variant={contract.variant}>{contract.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {t.tenantPhone && <p className="text-sm">Mobile: {t.tenantPhone}</p>}
                <p className="text-sm text-muted-foreground">
                  Lease: {new Date(t.leaseStartDate).toLocaleDateString()} – {new Date(t.leaseEndDate).toLocaleDateString()}
                </p>
                {t.status === "PENDING" && t.inviteToken && (
                  <p className="break-all text-xs text-primary">Invite: {inviteLink(t.inviteToken)}</p>
                )}
                {lease && (
                  <a href={lease.storagePath} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    View contract: {lease.title}
                  </a>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="mr-1 h-3 w-3" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteTenant(t.id, t.tenantName)}>
                    <Trash2 className="mr-1 h-3 w-3" />Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={editId !== null} onOpenChange={(o) => { if (!o) { setEditId(null); setForm(emptyTenantForm()); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit tenant</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <TenantFormFields form={form} setForm={setForm} showLeaseUpload />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TenantsListPage() {
  const tenantsUrl = "/api/tenants";
  const { data: tenants, isLoading } = useSWR<TenancyRecord[]>(tenantsUrl, swrFetcher);

  if (isLoading) return <p className="text-muted-foreground">Loading tenants...</p>;

  if (!tenants?.length) {
    return (
      <p className="text-muted-foreground">
        No tenants yet. Open a property and use the Tenants tab to add one.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tenants.map((t) => {
        const contract = leaseStatus(t);
        return (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{t.tenantName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.tenantEmail}</p>
                </div>
                <Badge variant={contract.variant}>{contract.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {t.property && (
                <Link href={`/dashboard/properties/${t.property.id}`} className="text-sm text-primary hover:underline">
                  {t.property.address}
                </Link>
              )}
              <Badge variant="outline">{t.status}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
