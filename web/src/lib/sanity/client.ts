import { createClient } from "@sanity/client";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "a5yzz6tx";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-01-01";

/** Read-only client for published content. No token, safe anywhere. */
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/** Server only. Reads and writes private documents (pickup orders). Never import in client code. */
export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;
  return createClient({ projectId, dataset, apiVersion, useCdn: false, token, perspective: "raw" });
}
