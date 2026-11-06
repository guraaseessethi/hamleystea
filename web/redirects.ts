import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * 301s from every page on the old barrieteaandcoffee.ca site (crawled Nov 2026)
 * to the closest page on the new one. Specific products first, then catch-alls.
 * Order matters: Next uses the first match.
 */
const p = (source: string, destination: string): Redirect => ({ source, destination, permanent: true });

// old product pages that have a direct match on the new site
const PRODUCT_MAP: Record<string, string> = {
  "/products/coffee-blends/cottage-blend-coffee": "/shop/cottage-blend",
  "/products/coffee-blends/galapagos-islands-coffee-san-cristobal-island": "/shop/galapagos-blend",
  "/products/coffee-blends/french-blend": "/shop/french-roast",
  "/products/coffee-blends/italian-blend": "/shop/italian-roast",
  "/products/flavoured-coffee/holiday-grog": "/shop/holiday-grog",
  "/products/flavoured-coffee/toffee-flavoured-coffee": "/shop/toffee",
  "/products/seasonal-and-rotational-coffees/cuban-peaberry-coffee": "/shop/cuban-peaberry",
  "/products/seasonal-and-rotational-coffees/kenya-tembo-aa-coffee": "/shop/kenya-tembo-aa",
  "/products/seasonal-and-rotational-coffees/nepal-mount-everest-supreme-coffee": "/shop/nepal-mount-everest",
  "/products/seasonal-and-rotational-coffees/nicaragua-peaberry-coffee": "/shop/nicaragua-peaberry",
  "/products/single-origin/brazil": "/shop/brazil",
  "/products/single-origin/guatemala-antigua-coffee": "/shop/guatemala-antigua",
  "/products/single-origin/monsoon-malabar-coffee": "/shop/monsoon-malabar",
  "/products/single-origin/peru-organic-fair-trade": "/shop/peru-organic-fair-trade",
  "/products/coffee-decafs/decaf-espresso-swiss-water-process": "/shop/swiss-water-decaf",
};

export const redirects: Redirect[] = [
  ...Object.entries(PRODUCT_MAP).flatMap(([from, to]) => [p(from, to), p(`${from}/`, to)]),

  // gear and equipment: the shop sells Bodum in store
  p("/products/bodum-products/:path*", "/visit"),
  p("/products/coffee-equipment/:path*", "/visit"),
  p("/specialties/specialties-2792/tea-pots-and-accessories", "/visit"),

  // everything else under products is coffee, everything under specialties is tea
  p("/products/amp", "/coffee"),
  p("/products", "/coffee"),
  p("/products/:path*", "/coffee"),
  p("/specialties/amp", "/tea"),
  p("/specialties", "/tea"),
  p("/specialties/:path*", "/tea"),

  // company pages
  p("/profile", "/about"),
  p("/contact", "/visit"),
  p("/map", "/visit"),
  p("/testimonials", "/#reviews"),
  p("/social", "/"),
  p("/start", "/"),
  p("/site-map", "/"),
  p("/amp", "/"),
];
