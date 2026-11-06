import { defineField, defineType } from "sanity";

export const teaCategory = defineType({
  name: "teaCategory",
  title: "Tea category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "One line", type: "string", description: "A few words, like: Bold breakfast cups" }),
    defineField({ name: "order", title: "Position", type: "number", description: "1 shows first, 2 next, and so on.", initialValue: 10 }),
  ],
  orderings: [{ title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "description" } },
});
