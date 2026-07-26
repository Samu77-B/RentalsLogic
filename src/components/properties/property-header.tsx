"use client";

import useSWR from "swr";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { FileUpload } from "@/components/shared/file-upload";
import { swrFetcher, reloadSWR } from "@/lib/swr";

type PropertyHeaderData = {
  id: string;
  address: string;
  rentAmount: string | number;
  rentPeriod?: string;
  propertyType: string;
  city?: string | null;
  coverPhotoUrl?: string | null;
};

export function PropertyHeader({ propertyId }: { propertyId: string }) {
  const propertyUrl = `/api/properties/${propertyId}`;
  const { data: property, mutate, isLoading } = useSWR<PropertyHeaderData>(
    propertyUrl,
    swrFetcher
  );
  const [saving, setSaving] = useState(false);

  async function saveCoverPhoto(url: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save property photo");
      await reloadSWR(mutate, propertyUrl);
      toast.success("Property photo saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save property photo");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !property) {
    return (
      <div className="mb-6 animate-pulse space-y-3">
        <div className="h-8 w-64 rounded-full bg-white/10" />
        <div className="h-48 rounded-3xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {property.address}
        </h1>
        <p className="mt-1 text-white/60">
          £{property.rentAmount}/{property.rentPeriod?.toLowerCase()} · {property.propertyType}
          {property.city ? ` · ${property.city}` : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white text-neutral-950 ring-1 ring-black/5">
        {property.coverPhotoUrl ? (
          <div className="relative h-52 w-full sm:h-64">
            <Image
              src={property.coverPhotoUrl}
              alt={property.address}
              fill
              className="object-cover"
              unoptimized={property.coverPhotoUrl.startsWith("data:")}
            />
          </div>
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-3 bg-[#f5f5f7] px-6 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-black/5">
              <Camera className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-heading text-base font-semibold tracking-tight">
                Add a property photo
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                You can upload this anytime — even after creating the property.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t border-black/5 p-4">
          <FileUpload
            label={property.coverPhotoUrl ? "Change photo" : "Upload property photo"}
            onUpload={saveCoverPhoto}
          />
          {saving && (
            <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
