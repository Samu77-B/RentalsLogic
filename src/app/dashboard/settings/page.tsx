import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Account settings are managed through your profile menu. Configure Clerk
            metadata for role assignment (landlord/tenant).
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
