# Hamley's Tea & Coffee

Website for Hamley's Tea & Coffee Co., Barrie, Ontario.

- `web/` Next.js 16 (App Router, TypeScript, Tailwind v4). Deployed on Vercel.
- `studio/` Sanity Studio, standalone. Content lives in Sanity project `a5yzz6tx`, dataset `production`.

## Run it

```bash
cd web && cp .env.example .env.local   # fill in the values, never commit them
npm install && npm run dev

cd studio && npm install && npm run dev   # Studio on http://localhost:3333
```

## Content and the owner's Studio

Everything the owner edits is in the Studio: Orders, Products (drag to reorder), Tea categories,
Home page, Settings (hours, holiday closures, pickup on/off, Google rating) and the Journal.
The Journal link stays hidden on the site until there is a first post.

Italic copper words in headings are written with stars, for example `Fall, *by the cup.*`.

## Pickup orders

`POST /api/pickup` validates with zod, re-checks the slot against the shop hours in Toronto time,
re-prices every item from Sanity, saves a `pickupOrder.<uuid>` document (dotted id, so it is private)
with a server only token, then sends two emails with Resend. Prices and names are copied into the order.
Payments go through the `lib/payments` interface. Only the `none` provider exists today.

## Environment

See `web/.env.example`. Server only secrets: `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`,
`SANITY_REVALIDATE_SECRET`.

## Sanity webhook (refreshes the site when content changes)

sanity.io/manage > API > Webhooks: URL `https://<site>/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`,
projection `{_type}`, trigger on create, update and delete, dataset production.

## Photos

Originals are kept out of git. `web/scripts/resize-images.mjs` rebuilds the web sized copies in `web/public`.
Every photo on the site can be swapped from the Studio (home page photos and product photos).
