"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  className?: string;
  label?: string;
}

const OFFLINE_KEY = "rentalslogic-pending-uploads";

export function FileUpload({
  onUpload,
  accept = "image/*",
  className,
  label = "Upload file",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      if (!navigator.onLine) {
        const dataUrl = await readFileAsDataUrl(file);
        const pending = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]");
        pending.push({ name: file.name, dataUrl, timestamp: Date.now() });
        localStorage.setItem(OFFLINE_KEY, JSON.stringify(pending));
        onUpload(dataUrl);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUpload(data.url);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Configure BLOB_READ_WRITE_TOKEN or try again when online.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {label}
      </Button>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
