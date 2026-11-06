import { defineArrayMember, defineField, defineType } from "sanity";

const locked = { readOnly: true };

/**
 * Written by the website, never by hand. Names and prices are copied in at the
 * time of the order, so changing or deleting a product later never changes an
 * old order. The product link is a weak reference for the same reason.
 */
export const pickupOrder = defineType({
  name: "pickupOrder",
  title: "Pickup order",
  type: "document",
  fields: [
    defineField({ name: "orderNumber", title: "Order number", type: "string", ...locked }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Change this as the order moves along.",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Bagged, ready for pickup", value: "bagged" },
          { title: "Picked up", value: "picked up" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "new",
    }),
    defineField({ name: "customerName", title: "Customer", type: "string", ...locked }),
    defineField({ name: "customerPhone", title: "Phone", type: "string", ...locked }),
    defineField({ name: "customerEmail", title: "Email", type: "string", ...locked }),
    defineField({ name: "pickupLabel", title: "Pickup", type: "string", ...locked }),
    defineField({ name: "pickupAt", title: "Pickup time", type: "datetime", ...locked }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      ...locked,
      of: [
        defineArrayMember({
          type: "object",
          name: "orderItem",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({ name: "type", type: "string" }),
            defineField({ name: "sizeLabel", title: "Size", type: "string" }),
            defineField({ name: "grind", type: "string" }),
            defineField({ name: "qty", title: "Quantity", type: "number" }),
            defineField({ name: "unitPrice", title: "Price each", type: "number" }),
            defineField({ name: "product", type: "reference", to: [{ type: "product" }], weak: true }),
          ],
          preview: {
            select: { name: "name", qty: "qty", size: "sizeLabel", grind: "grind", price: "unitPrice" },
            prepare: ({ name, qty, size, grind, price }) => ({
              title: `${qty} x ${name}`,
              subtitle: [size, grind && `Grind: ${grind}`, typeof price === "number" ? `$${price.toFixed(2)} each` : "priced at pickup"].filter(Boolean).join(" · "),
            }),
          },
        }),
      ],
    }),
    defineField({ name: "pricedTotal", title: "Total of priced items", type: "number", ...locked }),
    defineField({ name: "notes", title: "Customer note", type: "text", rows: 3, ...locked }),
    defineField({ name: "createdAt", title: "Placed", type: "datetime", ...locked }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { n: "orderNumber", name: "customerName", when: "pickupLabel", status: "status" },
    prepare: ({ n, name, when, status }) => ({ title: `${n} · ${name}`, subtitle: `${status} · ${when}` }),
  },
});
