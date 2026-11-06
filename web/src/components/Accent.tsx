import { Fragment } from "react";

/**
 * Turns "Steeped *by the scoop.*" into text with an italic accent.
 * The owner types stars around the words they want in italic copper.
 */
export function Accent({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

/** Same text with the stars removed, for meta tags and alt text. */
export function plain(text: string): string {
  return text.replace(/\*/g, "");
}
