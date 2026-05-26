"use client";

import { useState } from "react";
import useSWR from "swr";
import { TenantShell } from "@/components/layout/tenant-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/shared/signature-pad";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function TenantDocumentsList() {
  const { data } = useSWR("/api/tenant/dashboard", fetcher);
  const propertyId = data?.properties?.[0]?.id;
  const { data: documents, mutate } = useSWR(
    propertyId ? `/api/properties/${propertyId}/documents` : null,
    fetcher
  );
  const [signDocId, setSignDocId] = useState<string | null>(null);

  async function signDocument(signatureData: string) {
    if (!signDocId) return;
    await fetch(`/api/documents/${signDocId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData }),
    });
    setSignDocId(null);
    mutate();
  }

  return (
    <div className="space-y-4">
      {!documents?.length ? (
        <p className="text-muted-foreground">No documents available.</p>
      ) : (
        documents.map((doc: { id: string; title: string; isSigned: boolean; storagePath: string }) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{doc.title}</CardTitle>
                <Badge variant={doc.isSigned ? "default" : "secondary"}>
                  {doc.isSigned ? "Signed" : "Awaiting signature"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href={doc.storagePath} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                View document
              </a>
              {!doc.isSigned && (
                signDocId === doc.id ? (
                  <SignaturePad
                    onSave={signDocument}
                    onCancel={() => setSignDocId(null)}
                  />
                ) : (
                  <Button size="sm" onClick={() => setSignDocId(doc.id)}>Sign document</Button>
                )
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function TenantDocumentsPage() {
  return (
    <TenantShell>
      <h2 className="mb-6 text-2xl font-bold">Documents</h2>
      <TenantDocumentsList />
    </TenantShell>
  );
}
