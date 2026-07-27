"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { swrFetcher, reloadSWR } from "@/lib/swr";

type Tip = {
  id: string;
  title: string;
  body: string;
  category?: string | null;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
};

type TipsResponse = { tips: Tip[]; isAdmin: boolean };

const emptyForm = { title: "", body: "", category: "", published: true, sortOrder: 0 };

export default function TipsPage() {
  const tipsUrl = "/api/tips";
  const { data, mutate, isLoading, error } = useSWR<TipsResponse>(tipsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tip | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = data?.isAdmin ?? false;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(tip: Tip) {
    setEditing(tip);
    setForm({
      title: tip.title,
      body: tip.body,
      category: tip.category ?? "",
      published: tip.published,
      sortOrder: tip.sortOrder,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/tips/${editing.id}` : "/api/tips", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to save tip");
      setOpen(false);
      await reloadSWR(mutate, tipsUrl);
      toast.success(editing ? "Tip updated" : "Tip published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save tip");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tip: Tip) {
    if (!confirm(`Delete tip “${tip.title}”?`)) return;
    try {
      const res = await fetch(`/api/tips/${tip.id}`, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to delete tip");
      await reloadSWR(mutate, tipsUrl);
      toast.success("Tip deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tip");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
              Guidance
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Tips
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Practical notes from RentalsLogic staff to help you run your portfolio
              smoothly.
            </p>
          </div>
          {isAdmin && (
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  setEditing(null);
                  setForm(emptyForm);
                }
              }}
            >
              <DialogTrigger
                render={
                  <Button
                    className="rounded-full bg-white text-neutral-950 hover:bg-white/90"
                    onClick={() => {
                      setEditing(null);
                      setForm(emptyForm);
                    }}
                  >
                    <Plus className="mr-2 size-4" />
                    New tip
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit tip" : "New tip"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label htmlFor="tip-title">Title</Label>
                    <Input
                      id="tip-title"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tip-category">Category (optional)</Label>
                    <Input
                      id="tip-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Compliance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tip-body">Body</Label>
                    <Textarea
                      id="tip-body"
                      required
                      rows={6}
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    Published
                  </label>
                  <Button type="submit" className="w-full rounded-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : editing ? (
                      "Save changes"
                    ) : (
                      "Publish tip"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading && <p className="text-white/60">Loading tips...</p>}
        {error && (
          <p className="text-sm text-red-300">
            {error instanceof Error ? error.message : "Could not load tips."} Run the tips
            SQL migration in Neon if tables are missing.
          </p>
        )}

        {!isLoading && !data?.tips?.length && (
          <div className="rounded-3xl bg-white p-8 text-neutral-950 ring-1 ring-black/5">
            <p className="font-heading text-lg font-semibold tracking-tight">No tips yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              {isAdmin
                ? "Create the first tip for landlords."
                : "RentalsLogic staff will publish tips here soon."}
            </p>
            {isAdmin && (
              <Button className="mt-4 rounded-full" onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                New tip
              </Button>
            )}
          </div>
        )}

        <div className="grid gap-4">
          {data?.tips?.map((tip) => (
            <article
              key={tip.id}
              className="rounded-3xl bg-white p-6 text-neutral-950 ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {tip.category && (
                    <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                      {tip.category}
                      {!tip.published && " · Draft"}
                    </p>
                  )}
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{tip.title}</h2>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(tip)}
                      aria-label="Edit tip"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(tip)}
                      aria-label="Delete tip"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-600">
                {tip.body}
              </p>
              <p className="mt-4 text-xs text-neutral-400">
                Updated {new Date(tip.updatedAt).toLocaleDateString("en-GB")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
