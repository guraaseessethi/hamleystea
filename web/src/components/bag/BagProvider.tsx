"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GRINDS, type BagLine, type Grind, type Product, type SiteSettings } from "@/lib/types";

const STORAGE_KEY = "hamleys-bag-v1";

type Panel = "bag" | "menu" | null;

interface BagContextValue {
  settings: SiteSettings;
  hasPosts: boolean;
  lines: BagLine[];
  count: number;
  /** Sum of priced lines only. */
  subtotal: number;
  hasUnpriced: boolean;
  qtyOf: (slug: string) => number;
  add: (product: Product, opts?: { sizeLabel?: string; grind?: Grind; qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  setGrind: (key: string, grind: Grind) => void;
  clear: () => void;
  panel: Panel;
  openBag: () => void;
  openMenu: () => void;
  closePanel: () => void;
  toast: string;
  hydrated: boolean;
}

const BagContext = createContext<BagContextValue | null>(null);

export function useBag(): BagContextValue {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside BagProvider");
  return ctx;
}

function readStorage(): BagLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is BagLine =>
        l &&
        typeof l.key === "string" &&
        typeof l.slug === "string" &&
        typeof l.name === "string" &&
        typeof l.qty === "number" &&
        l.qty > 0,
    );
  } catch {
    return [];
  }
}

function writeStorage(lines: BagLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* private mode or storage full: the bag just won't survive a refresh */
  }
}

export function BagProvider({
  settings,
  hasPosts,
  children,
}: {
  settings: SiteSettings;
  hasPosts: boolean;
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // localStorage only exists in the browser, so the saved bag loads after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(lines);
  }, [lines, hydrated]);

  // keep two open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showToast = useCallback((text: string) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const add = useCallback<BagContextValue["add"]>(
    (product, opts) => {
      const size = product.sizes.find((s) => s.label === opts?.sizeLabel) ?? product.sizes[0] ?? { label: "Standard", price: null };
      const key = `${product.slug}|${size.label}`;
      const addQty = opts?.qty ?? 1;
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) =>
            l.key === key ? { ...l, qty: l.qty + addQty, grind: opts?.grind ?? l.grind } : l,
          );
        }
        const line: BagLine = {
          key,
          productId: product.slug,
          slug: product.slug,
          name: product.name,
          type: product.type,
          category: product.category,
          sizeLabel: size.label,
          unitPrice: typeof size.price === "number" ? size.price : null,
          grind: product.type === "coffee" ? (opts?.grind ?? GRINDS[0]) : undefined,
          qty: addQty,
        };
        return [...prev, line];
      });
      showToast(`${product.name} added to your bag`);
    },
    [showToast],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const setGrind = useCallback((key: string, grind: Grind) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, grind } : l)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<BagContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + (l.unitPrice ? l.unitPrice * l.qty : 0), 0);
    return {
      settings,
      hasPosts,
      lines,
      count,
      subtotal,
      hasUnpriced: lines.some((l) => !l.unitPrice),
      qtyOf: (slug) => lines.filter((l) => l.slug === slug).reduce((n, l) => n + l.qty, 0),
      add,
      setQty,
      setGrind,
      clear,
      panel,
      openBag: () => setPanel("bag"),
      openMenu: () => setPanel("menu"),
      closePanel: () => setPanel(null),
      toast,
      hydrated,
    };
  }, [lines, settings, hasPosts, add, setQty, setGrind, clear, panel, toast, hydrated]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}
