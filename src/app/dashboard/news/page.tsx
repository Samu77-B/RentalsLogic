"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { swrFetcher, reloadSWR } from "@/lib/swr";
import { cn } from "@/lib/utils";

type NewsCategory = "LANDLORD_LAW" | "TENANT_LAW" | "UK_NEWS";

type Article = {
  id: string;
  title: string;
  summary: string;
  body?: string | null;
  category: NewsCategory;
  sourceName?: string | null;
  sourceUrl?: string | null;
  published: boolean;
  publishedAt: string;
};

type NewsResponse = { articles: Article[]; isAdmin: boolean };

const categoryLabels: Record<NewsCategory | "ALL", string> = {
  ALL: "All",
  LANDLORD_LAW: "Landlord law",
  TENANT_LAW: "Tenant law",
  UK_NEWS: "UK news",
};

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  category: "UK_NEWS" as NewsCategory,
  sourceName: "",
  sourceUrl: "",
  published: true,
};

export default function NewsPage() {
  const [filter, setFilter] = useState<NewsCategory | "ALL">("ALL");
  const newsUrl = filter === "ALL" ? "/api/news" : `/api/news?category=${filter}`;
  const { data, mutate, isLoading, error } = useSWR<NewsResponse>(newsUrl, swrFetcher);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = data?.isAdmin ?? false;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(article: Article) {
    setEditing(article);
    setForm({
      title: article.title,
      summary: article.summary,
      body: article.body ?? "",
      category: article.category,
      sourceName: article.sourceName ?? "",
      sourceUrl: article.sourceUrl ?? "",
      published: article.published,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/news/${editing.id}` : "/api/news",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to save article");
      setOpen(false);
      await reloadSWR(mutate, newsUrl);
      toast.success(editing ? "Article updated" : "Article published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Delete “${article.title}”?`)) return;
    try {
      const res = await fetch(`/api/news/${article.id}`, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to delete article");
      await reloadSWR(mutate, newsUrl);
      toast.success("Article deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete article");
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
              Updates
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              News & law
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Landlord law, tenant law, and UK rental news curated by RentalsLogic
              staff.
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
                    New article
                  </Button>
                }
              />
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit article" : "New article"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm({ ...form, category: (v as NewsCategory) ?? "UK_NEWS" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LANDLORD_LAW">Landlord law</SelectItem>
                        <SelectItem value="TENANT_LAW">Tenant law</SelectItem>
                        <SelectItem value="UK_NEWS">UK news</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Summary</Label>
                    <Textarea
                      required
                      rows={3}
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Full article (optional)</Label>
                    <Textarea
                      rows={5}
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Source name</Label>
                      <Input
                        value={form.sourceName}
                        onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                        placeholder="e.g. GOV.UK"
                      />
                    </div>
                    <div>
                      <Label>Source URL</Label>
                      <Input
                        value={form.sourceUrl}
                        onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
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
                      "Publish article"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as Array<NewsCategory | "ALL">).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                filter === key
                  ? "bg-white text-neutral-950"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              )}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-white/60">Loading news...</p>}
        {error && (
          <p className="text-sm text-red-300">
            {error instanceof Error ? error.message : "Could not load news."} Run the news
            SQL migration in Neon if tables are missing.
          </p>
        )}

        {!isLoading && !data?.articles?.length && (
          <div className="rounded-3xl bg-white p-8 text-neutral-950 ring-1 ring-black/5">
            <p className="font-heading text-lg font-semibold tracking-tight">No articles yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              {isAdmin
                ? "Publish the first law or news update."
                : "RentalsLogic staff will post UK rental updates here."}
            </p>
            {isAdmin && (
              <Button className="mt-4 rounded-full" onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                New article
              </Button>
            )}
          </div>
        )}

        <div className="grid gap-4">
          {data?.articles?.map((article) => (
            <article
              key={article.id}
              className="rounded-3xl bg-white p-6 text-neutral-950 ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{categoryLabels[article.category]}</Badge>
                    {!article.published && <Badge variant="outline">Draft</Badge>}
                    <span className="text-xs text-neutral-400">
                      {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{article.title}</h2>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => openEdit(article)}
                      aria-label="Edit article"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDelete(article)}
                      aria-label="Delete article"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                {article.summary}
              </p>
              {article.body && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-500">
                  {article.body}
                </p>
              )}
              {(article.sourceName || article.sourceUrl) && (
                <p className="mt-4 text-sm text-neutral-500">
                  Source:{" "}
                  {article.sourceUrl ? (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-neutral-950 underline underline-offset-2"
                    >
                      {article.sourceName || "Read more"}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    article.sourceName
                  )}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
