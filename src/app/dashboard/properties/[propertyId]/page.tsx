import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyHeader } from "@/components/properties/property-header";
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
      <PropertyHeader propertyId={propertyId} />
      <Tabs defaultValue="inventory" className="min-w-0">
        <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="h-auto min-w-max gap-1 px-1">
            <TabsTrigger value="inventory" className="flex-none px-3">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex-none px-3">
              Tenants
            </TabsTrigger>
            <TabsTrigger value="meters" className="flex-none px-3">
              Meters
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-none px-3">
              Documents
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-none px-3">
              Maintenance
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inventory" className="mt-6 min-w-0">
          <PropertyDetail propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="tenants" className="mt-6 min-w-0">
          <TenantsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="meters" className="mt-6 min-w-0">
          <MeterReadingsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6 min-w-0">
          <DocumentsPanel propertyId={propertyId} />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6 min-w-0">
          <MaintenanceManager propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
