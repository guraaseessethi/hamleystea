import { defineArrayMember, defineField, defineType } from "sanity";

const accentHint = "Put *stars* around words you want in italics and copper, like: Steeped *by the scoop.*";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Top of the page", default: true },
    { name: "facts", title: "Three reasons" },
    { name: "shop", title: "Shop and seasonal" },
    { name: "story", title: "Our story" },
    { name: "reviews", title: "Reviews" },
    { name: "visit", title: "Visit" },
  ],
  fields: [
    defineField({ name: "heroHeadline", title: "Big headline", type: "string", group: "hero", description: accentHint, initialValue: "Roasted down the street. *Steeped by the scoop.*" }),
    defineField({ name: "heroSubline", title: "Line under the headline", type: "text", rows: 3, group: "hero" }),
    defineField({ name: "heroImage", title: "Top photo", type: "image", options: { hotspot: true }, group: "hero", description: "Wide photo behind the headline. Click the hotspot to keep the important part in frame. If empty, the roaster photo is used.", fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),

    defineField({
      name: "facts",
      title: "Three reasons strip",
      type: "array",
      group: "facts",
      description: "Exactly three short reasons to visit.",
      validation: (r) => r.max(3),
      of: [defineArrayMember({ type: "object", name: "fact", fields: [defineField({ name: "title", title: "Short title", type: "string" }), defineField({ name: "text", title: "One sentence", type: "text", rows: 2 })], preview: { select: { title: "title", subtitle: "text" } } })],
    }),

    defineField({ name: "shopHeading", title: "Shop heading", type: "string", group: "shop", description: accentHint }),
    defineField({ name: "seasonalHeading", title: "Seasonal section heading", type: "string", group: "shop", description: `${accentHint} The four cards below it come from products ticked Seasonal.` }),
    defineField({ name: "seasonalText", title: "Seasonal section text", type: "text", rows: 2, group: "shop" }),

    defineField({ name: "storyHeading", title: "Story heading", type: "string", group: "story", description: accentHint }),
    defineField({ name: "storyText", title: "Short story (home page)", type: "text", rows: 5, group: "story" }),
    defineField({ name: "aboutStory", title: "Longer story (Our roastery page)", type: "text", rows: 12, group: "story", description: "Leave a blank line between paragraphs." }),
    defineField({ name: "storyImage", title: "Wide photo (Our roastery page)", type: "image", options: { hotspot: true }, group: "story", fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),
    defineField({ name: "aboutImage", title: "Tall photo (Our roastery page)", type: "image", options: { hotspot: true }, group: "story", fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),
    defineField({
      name: "stats",
      title: "Three numbers",
      type: "array",
      group: "story",
      description: "Big numbers with a small label, like 2005 / Roasting in Barrie since.",
      validation: (r) => r.max(3),
      of: [defineArrayMember({ type: "object", name: "stat", fields: [defineField({ name: "value", title: "Big number", type: "string" }), defineField({ name: "label", title: "Small label", type: "string" })], preview: { select: { title: "value", subtitle: "label" } } })],
    }),
    defineField({ name: "gearLine", title: "Brewing gear line", type: "string", group: "story" }),

    defineField({ name: "reviewsHeading", title: "Reviews heading", type: "string", group: "reviews", description: accentHint }),
    defineField({
      name: "reviewThemes",
      title: "What people mention most",
      type: "array",
      group: "reviews",
      description: "Short phrases from your Google reviews. Please only add things customers really say. Do not invent quotes.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),

    defineField({ name: "visitHeading", title: "Visit heading", type: "string", group: "visit", description: accentHint }),
    defineField({ name: "visitText", title: "Visit line", type: "text", rows: 2, group: "visit" }),
    defineField({ name: "visitImage", title: "Shop photo (Visit page)", type: "image", options: { hotspot: true }, group: "visit", fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })] }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
