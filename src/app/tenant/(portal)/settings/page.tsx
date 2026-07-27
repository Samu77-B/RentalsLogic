import { TenantShell } from "@/components/layout/tenant-shell";
import { TenantPreferences } from "@/components/tenant/tenant-preferences";

export default function TenantSettingsPage() {
  return (
    <TenantShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/60">
          Choose how you want updates about maintenance and other property news.
        </p>
      </div>
      <TenantPreferences />
    </TenantShell>
  );
}
