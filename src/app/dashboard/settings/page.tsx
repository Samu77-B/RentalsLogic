import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            Account details are managed through your profile menu (top right).
          </p>
          <p className="text-sm text-muted-foreground">
            Landlord accounts are created when you sign up from the homepage.
            Tenant accounts are created when you accept an invitation from your landlord.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
