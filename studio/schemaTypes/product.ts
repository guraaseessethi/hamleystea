import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

const COFFEE_CATEGORIES = ["Seasonal", "Single origin", "Blend", "Flavoured", "Decaf"];
const TEA_CATEGORIES = ["Black", "Earl Grey", "Green", "Oolong", "Chai", "Rooibos", "Fruit", "Iced", "Seasonal"];

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "product" }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "Click Generate. It becomes the page address.", options: { source: "name", maxLength: 80 }, validation: (r) => r.required() }),
    defineField({
      name: "type",
      title: "What is it?",
      type: "string",
      options: { list: [{ title: "Coffee", value: "coffee" }, { title: "Tea", value: "tea" }, { title: "Brewing gear", value: "gear" }], layout: "radio" },
      initialValue: "coffee",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coffeeCategory",
      title: "Coffee type",
      type: "string",
      options: { list: COFFEE_CATEGORIES },
      hidden: ({ document }) => document?.type !== "coffee",
      validation: (r) => r.custom((v, ctx) => (ctx.document?.type === "coffee" && !v ? "Pick a coffee type" : true)),
    }),
    defineField({
      name: "teaCategory",
      title: "Tea type",
      type: "string",
      options: { list: TEA_CATEGORIES },
      hidden: ({ document }) => document?.type !== "tea",
      validation: (r) => r.custom((v, ctx) => (ctx.document?.type === "tea" && !v ? "Pick a tea type" : true)),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Optional. With no photo, the site shows a coffee bag in the right colour.",
      fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })],
    }),
    defineField({ name: "shortDescription", title: "Short description", type: "text", rows: 3, description: "One or two sentences. Plain and warm." }),
    defineField({
      name: "sizes",
      title: "Sizes and prices",
      type: "array",
      description: "Add one row per size, like 75g and 5.85. Leave the price empty to show Ask in store.",
      of: [
        defineArrayMember({
          type: "object",
          name: "size",
          fields: [
            defineField({ name: "label", title: "Size", type: "string", description: "For example 75g or 1 lb", validation: (r) => r.required() }),
            defineField({ name: "price", title: "Price in dollars", type: "number", description: "Numbers only, like 5.85. Empty means Ask in store.", validation: (r) => r.min(0) }),
          ],
          preview: { select: { title: "label", price: "price" }, prepare: ({ title, price }) => ({ title, subtitle: typeof price === "number" ? `$${price.toFixed(2)}` : "Ask in store" }) },
        }),
      ],
    }),
    defineField({ name: "seasonal", title: "Show in the Seasonal section", type: "boolean", description: "Up to four of these appear in the dark band on the home page.", initialValue: false }),
    defineField({ name: "inStock", title: "In stock", type: "boolean", description: "Turn off to show Sold out and stop orders.", initialValue: true }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "name", coffee: "coffeeCategory", tea: "teaCategory", type: "type", media: "photo", stock: "inStock" },
    prepare: ({ title, coffee, tea, type, media, stock }) => ({ title, subtitle: `${coffee || tea || type}${stock === false ? " · sold out" : ""}`, media }),
  },
});
