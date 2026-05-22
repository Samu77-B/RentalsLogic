import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PropertyDetail } from "@/components/properties/property-detail";
import {
  MeterReadingsPanel,
  TenantsPanel,
  DocumentsPanel,
} from "@/components/properties/property-panels";
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
      </Tabs>
    </DashboardShell>
  );
}
