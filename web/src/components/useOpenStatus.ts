"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/hours";
import type { SiteSettings } from "@/lib/types";

/**
 * Live open/closed status in Toronto time. Returns null on the server and first
 * paint so the static page never shows a stale "open now".
 */
export function useOpenStatus(settings: SiteSettings): { open: boolean; text: string } | null {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getStatus(settings));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [settings]);
  return status;
}
