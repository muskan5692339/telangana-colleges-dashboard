"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureNodePng } from "@/lib/capture-node";
import { toast } from "sonner";

export function CaptureButton({
  targetRef,
  filename,
  label = "Screenshot table",
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function onCapture() {
    const node = targetRef.current;
    if (!node) {
      toast("Nothing to capture yet");
      return;
    }
    setBusy(true);
    try {
      await captureNodePng(node, filename);
    } catch {
      toast("Could not capture this table. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onCapture}
      disabled={busy}
      className="h-12 min-w-[11rem] gap-2 rounded-full px-4 text-sm font-semibold"
    >
      <Camera className="h-4 w-4" />
      {busy ? "Saving…" : label}
    </Button>
  );
}
