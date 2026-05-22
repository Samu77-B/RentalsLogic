"use client";

import { useState } from "react";
import useSWR from "swr";
import { TenantShell } from "@/components/layout/tenant-shell";
import { MeterReadingsPanel } from "@/components/properties/property-panels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TenantMetersPage() {
  const { data } = useSWR("/api/tenant/dashboard", fetcher);
  const [propertyId, setPropertyId] = useState("");

  const properties = data?.properties ?? [];
  const activePropertyId = propertyId || properties[0]?.id || "";

  return (
    <TenantShell>
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold">Meter Readings</h2>
        {properties.length > 1 && (
          <Select value={activePropertyId} onValueChange={(v) => setPropertyId(v ?? "")}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>
              {properties.map((p: { id: string; address: string }) => (
                <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {activePropertyId && <MeterReadingsPanel propertyId={activePropertyId} />}
    </TenantShell>
  );
}

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}
