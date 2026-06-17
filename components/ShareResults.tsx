"use client";

import { useState } from "react";
import { Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildTextReport } from "@/lib/report";
import type { FootprintResult } from "@/lib/carbon/types";

interface ShareResultsProps {
  result: FootprintResult;
}

/**
 * Lets the user share or download a summary of their footprint.
 *
 * Uses the Web Share API when available (mobile/modern browsers), falling back
 * to the clipboard. Download produces a plain-text report via a Blob — no
 * server round-trip and no extra dependency.
 */
export function ShareResults({ result }: ShareResultsProps) {
  const [status, setStatus] = useState<string>("");

  async function handleShare() {
    const text = buildTextReport(result);
    try {
      if (navigator.share) {
        await navigator.share({ title: "My EcoTrack footprint", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus("Summary copied to clipboard");
    } catch {
      // User dismissed the share sheet or clipboard was blocked — non-fatal.
      setStatus("");
    }
  }

  function handleDownload() {
    const text = buildTextReport(result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecotrack-footprint.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Report downloaded");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share summary
      </Button>
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Download report
      </Button>
      <span role="status" aria-live="polite" className="text-sm text-brand-700 dark:text-brand-300">
        {status ? (
          <span className="inline-flex items-center gap-1">
            <Check className="h-4 w-4" aria-hidden="true" />
            {status}
          </span>
        ) : null}
      </span>
    </div>
  );
}
