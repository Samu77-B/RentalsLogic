"use client";

import useSWR from "swr";
import Link from "next/link";
import { ClipboardList, Wrench, FileText, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TenantOverview() {
  const { data, isLoading } = useSWR("/api/tenant/dashboard", fetcher);

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  const actions = [
    { label: "Reports to review", value: data?.pendingReports ?? 0, href: routes.tenant.reports, icon: ClipboardList },
    { label: "Open maintenance", value: data?.openMaintenance ?? 0, href: routes.tenant.maintenance, icon: Wrench },
    { label: "Documents to sign", value: data?.unsignedDocs ?? 0, href: routes.tenant.documents, icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Tenancy</h1>
        <p className="text-muted-foreground">Welcome to your tenant portal</p>
      </div>

      {data?.properties?.map((property: {
        id: string;
        address: string;
        tenancies: Array<{ leaseStartDate: string; leaseEndDate: string }>;
      }) => (
        <Card key={property.id}>
          <CardHeader>
            <CardTitle>{property.address}</CardTitle>
          </CardHeader>
          <CardContent>
            {property.tenancies?.[0] && (
              <p className="text-sm text-muted-foreground">
                Lease: {new Date(property.tenancies[0].leaseStartDate).toLocaleDateString()} –{" "}
                {new Date(property.tenancies[0].leaseEndDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Link href={routes.tenant.meters}>
        <Button variant="outline">
          <Gauge className="mr-2 h-4 w-4" /> Submit meter reading
        </Button>
      </Link>
    </div>
  );
}
