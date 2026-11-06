// One-off: shrinks the big originals in ../photos and ../brand into web/public.
// Originals are never committed (see root .gitignore).
import sharp from "sharp";
import { readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const out = path.resolve(import.meta.dirname, "../public");

await mkdir(`${out}/images/stock`, { recursive: true });
await mkdir(`${out}/brand`, { recursive: true });

for (const f of await readdir(`${root}/photos/stock`)) {
  if (!f.endsWith(".jpg")) continue;
  const name = f.replace(/\.jpg$/, ".webp");
  await sharp(`${root}/photos/stock/${f}`)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 })
    .toFile(`${out}/images/stock/${name}`);
  console.log("photo", name);
}

await sharp(`${root}/brand/hamleys-roaster-photo.webp`)
  .resize({ width: 2000, withoutEnlargement: true })
  .webp({ quality: 76 })
  .toFile(`${out}/images/hero-roaster.webp`);

for (const n of ["light", "dark"]) {
  await sharp(`${root}/brand/hamleys-logo-${n}.png`)
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(`${out}/brand/logo-${n}.png`);
}
await copyFile(`${root}/brand/og-image-1200x630.jpg`, `${path.resolve(import.meta.dirname, "../src/app")}/opengraph-image.jpg`);
console.log("done");
