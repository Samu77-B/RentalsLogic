import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyDetail } from "@/components/properties/property-detail";
import {
  MeterReadingsPanel,
  DocumentsPanel,
} from "@/components/properties/property-panels";
import { TenantsPanel } from "@/components/tenants/tenants-panel";
import { MaintenanceManager } from "@/components/maintenance/maintenance-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { params: Promise<{ propertyId: string }> };

export default async function PropertyDetailPage({ params }: Props) {
  const { propertyId } = await params;

  return (
    <DashboardShell>
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-6">
          <PropertyDetail propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="tenants" className="mt-6">
          <TenantsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="meters" className="mt-6">
          <MeterReadingsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <DocumentsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
          <MaintenanceManager propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
