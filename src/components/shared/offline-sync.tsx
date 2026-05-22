"use client";

import { useEffect, useRef } from "react";

interface QueuedUpload {
  id: number;
  file: File;
  timestamp: string;
}

const QUEUE_KEY = "rentalslogic-offline-uploads";

export function OfflineSync() {
  const syncing = useRef(false);

  useEffect(() => {
    async function syncQueue() {
      if (syncing.current || !navigator.onLine) return;
      syncing.current = true;

      try {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return;

        const queue: QueuedUpload[] = JSON.parse(raw);
        const remaining: QueuedUpload[] = [];

        for (const item of queue) {
          try {
            const formData = new FormData();
            formData.append("file", item.file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) remaining.push(item);
          } catch {
            remaining.push(item);
          }
        }

        if (remaining.length) {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
        } else {
          localStorage.removeItem(QUEUE_KEY);
        }
      } finally {
        syncing.current = false;
      }
    }

    window.addEventListener("online", syncQueue);
    syncQueue();

    return () => window.removeEventListener("online", syncQueue);
  }, []);

  return null;
}

export function queueOfflineUpload(file: File) {
  const raw = localStorage.getItem(QUEUE_KEY);
  const queue = raw ? JSON.parse(raw) : [];
  queue.push({ id: Date.now(), file, timestamp: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
