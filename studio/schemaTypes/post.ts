import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Journal post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Web address", type: "slug", description: "Click Generate.", options: { source: "title", maxLength: 80 }, validation: (r) => r.required() }),
    defineField({ name: "date", title: "Date", type: "date", initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Short intro", type: "text", rows: 2, description: "Shows on the journal list and in Google." }),
    defineField({ name: "cover", title: "Cover photo", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),
    defineField({
      name: "body",
      title: "Post",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),
      ],
    }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "date", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "date", media: "cover" } },
});
