"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [empty, setEmpty] = useState(true);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            className: "w-full h-40 cursor-crosshair",
          }}
          onBegin={() => setEmpty(false)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            sigRef.current?.clear();
            setEmpty(true);
          }}
        >
          Clear
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          disabled={empty}
          onClick={() => {
            if (sigRef.current && !sigRef.current.isEmpty()) {
              onSave(sigRef.current.toDataURL());
            }
          }}
        >
          Save signature
        </Button>
      </div>
    </div>
  );
}
