"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/shared/file-upload";
import { SignaturePad } from "@/components/shared/signature-pad";
import { REPORT_TYPE_LABELS } from "@/lib/checklists";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TenantReportReview({ reportId }: { reportId: string }) {
  const { data: report, mutate } = useSWR(`/api/inspections/${reportId}`, fetcher);
  const [commentItemId, setCommentItemId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [showSign, setShowSign] = useState(false);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentItemId) return;
    await fetch(`/api/inspections/${reportId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportItemId: commentItemId, comment, photoUrls }),
    });
    setComment("");
    setPhotoUrls([]);
    setCommentItemId(null);
    mutate();
  }

  async function signReport(signatureData: string, approved: boolean) {
    await fetch(`/api/inspections/${reportId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData, approved }),
    });
    setShowSign(false);
    mutate();
  }

  if (!report) return <p>Loading...</p>;

  const canReview = ["SENT", "TENANT_REVIEW"].includes(report.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <p className="text-muted-foreground">
          {REPORT_TYPE_LABELS[report.type]} · {report.property?.address}
        </p>
        <Badge className="mt-2">{report.status}</Badge>
      </div>

      {report.sections?.map((section: {
        id: string;
        title: string;
        items: Array<{
          id: string;
          name: string;
          condition?: string;
          photoUrls: string[];
          tenantComments?: Array<{ comment: string }>;
        }>;
      }) => (
        <Card key={section.id}>
          <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Condition: {item.condition}</p>
                {item.photoUrls?.map((url, i) => (
                  <div key={i} className="relative mt-2 h-24 w-24 overflow-hidden rounded">
                    <Image src={url} alt={item.name} fill className="object-cover" />
                  </div>
                ))}
                {item.tenantComments?.map((c, i) => (
                  <p key={i} className="mt-2 text-sm text-muted-foreground">Your comment: {c.comment}</p>
                ))}
                {canReview && (
                  commentItemId === item.id ? (
                    <form onSubmit={submitComment} className="mt-3 space-y-2">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your comment..."
                        required
                      />
                      <FileUpload
                        label="Attach photo"
                        onUpload={(url) => setPhotoUrls([...photoUrls, url])}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Submit</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setCommentItemId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setCommentItemId(item.id)}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" /> Comment
                    </Button>
                  )
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {canReview && !showSign && (
        <div className="flex gap-3">
          <Button onClick={() => setShowSign(true)}>Approve & Sign</Button>
          <Button variant="outline" onClick={() => setShowSign(true)}>
            Dispute
          </Button>
        </div>
      )}

      {showSign && (
        <Card>
          <CardHeader><CardTitle>Sign report</CardTitle></CardHeader>
          <CardContent>
            <SignaturePad
              onSave={(data) => signReport(data, true)}
              onCancel={() => setShowSign(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
