"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { swrFetcher } from "@/lib/swr";

type Prefs = {
  phone: string | null;
  notifyEmail: boolean;
  notifyWhatsApp: boolean;
  notifyTelegram: boolean;
  whatsappNumber: string | null;
  telegramHandle: string | null;
  notifyMaintenance: boolean;
  notifyInspections: boolean;
  notifyDocuments: boolean;
};

function ToggleRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border px-3 py-3">
      <span>
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 size-4 accent-neutral-900"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function TenantPreferences() {
  const { data, isLoading, mutate } = useSWR<Prefs>(
    "/api/tenant/preferences",
    swrFetcher
  );
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Prefs | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tenant/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to save preferences");
      await mutate(payload, false);
      setForm(payload);
      toast.success("Communication preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !form) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading preferences…
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>How should we contact you?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose email, WhatsApp, and/or Telegram for updates about maintenance,
            inspections, and documents.
          </p>
          <ToggleRow
            checked={form.notifyEmail}
            onChange={(notifyEmail) => setForm({ ...form, notifyEmail })}
            title="Email"
            description="Receive updates at the email on your account"
          />
          <ToggleRow
            checked={form.notifyWhatsApp}
            onChange={(notifyWhatsApp) => setForm({ ...form, notifyWhatsApp })}
            title="WhatsApp"
            description="Get maintenance and other alerts on WhatsApp"
          />
          {form.notifyWhatsApp && (
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp number</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+447700900123"
                value={form.whatsappNumber ?? ""}
                onChange={(e) =>
                  setForm({ ...form, whatsappNumber: e.target.value })
                }
                required={form.notifyWhatsApp}
              />
            </div>
          )}
          <ToggleRow
            checked={form.notifyTelegram}
            onChange={(notifyTelegram) => setForm({ ...form, notifyTelegram })}
            title="Telegram"
            description="Get updates via Telegram username"
          />
          {form.notifyTelegram && (
            <div>
              <Label htmlFor="telegramHandle">Telegram username</Label>
              <Input
                id="telegramHandle"
                placeholder="@yourusername"
                value={form.telegramHandle ?? ""}
                onChange={(e) =>
                  setForm({ ...form, telegramHandle: e.target.value })
                }
                required={form.notifyTelegram}
              />
            </div>
          )}
          <div>
            <Label htmlFor="phone">Mobile (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What to notify me about</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            checked={form.notifyMaintenance}
            onChange={(notifyMaintenance) =>
              setForm({ ...form, notifyMaintenance })
            }
            title="Maintenance"
            description="Updates when jobs are logged or progress changes"
          />
          <ToggleRow
            checked={form.notifyInspections}
            onChange={(notifyInspections) =>
              setForm({ ...form, notifyInspections })
            }
            title="Inspections"
            description="When a report is ready to review or sign"
          />
          <ToggleRow
            checked={form.notifyDocuments}
            onChange={(notifyDocuments) =>
              setForm({ ...form, notifyDocuments })
            }
            title="Documents"
            description="Lease and other document requests"
          />
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save preferences"
        )}
      </Button>
    </form>
  );
}
