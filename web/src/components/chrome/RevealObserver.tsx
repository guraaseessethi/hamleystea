"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades sections in as they scroll into view. Elements marked data-reveal start
 * visible in the HTML, so nothing is hidden without JavaScript. Only ones below
 * the fold are hidden, then revealed. Skipped for prefers-reduced-motion.
 */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.shown)"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.remove("pending");
            e.target.classList.add("shown");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    for (const el of els) {
      if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add("pending");
      else el.classList.add("shown");
      io.observe(el);
    }
    return () => io.disconnect();
  }, [path]);
  return null;
}
