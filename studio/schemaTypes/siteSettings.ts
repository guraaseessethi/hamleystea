import { defineArrayMember, defineField, defineType } from "sanity";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const label = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);

/** Every half hour from 6 am to 10 pm, as { title: "9:00 am", value: "09:00" } */
const TIMES = Array.from({ length: 33 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    title: `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`,
    value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  };
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Business name", type: "string", initialValue: "Hamley's Tea & Coffee Co." }),
    defineField({ name: "phone", title: "Phone number", type: "string", description: "Shown on the site. Tapping it calls the shop.", initialValue: "(705) 719-1008" }),
    defineField({ name: "address", title: "Address", type: "string", description: "One line, like: 190 Minet's Point Rd, Barrie, ON L4N 8J8", initialValue: "190 Minet's Point Rd, Barrie, ON L4N 8J8" }),
    defineField({ name: "mapLink", title: "Directions link", type: "url", description: "The link behind the Get directions button. Paste a Google Maps link." }),
    defineField({
      name: "hours",
      title: "Opening hours",
      type: "array",
      description: "One row per day. Tick Closed for days you are shut. The pickup times customers see come from these hours.",
      validation: (r) => r.length(7),
      initialValue: DAYS.map((day) => ({ _type: "dayHours", day, closed: day === "sunday", open: "09:00", close: day === "saturday" ? "16:00" : "18:00" })),
      of: [
        defineArrayMember({
          type: "object",
          name: "dayHours",
          fields: [
            defineField({ name: "day", title: "Day", type: "string", readOnly: true, options: { list: DAYS.map((d) => ({ title: label(d), value: d })) } }),
            defineField({ name: "closed", title: "Closed all day", type: "boolean", initialValue: false }),
            defineField({ name: "open", title: "Opens", type: "string", options: { list: TIMES }, hidden: ({ parent }) => !!parent?.closed }),
            defineField({ name: "close", title: "Closes", type: "string", options: { list: TIMES }, hidden: ({ parent }) => !!parent?.closed }),
          ],
          preview: {
            select: { day: "day", closed: "closed", open: "open", close: "close" },
            prepare: ({ day, closed, open, close }) => ({ title: label(day || ""), subtitle: closed ? "Closed" : `${open} to ${close}` }),
          },
        }),
      ],
    }),
    defineField({
      name: "holidays",
      title: "Holiday closures",
      type: "array",
      description: "Add each day the shop is closed for a holiday. Customers will not be offered pickup on these days.",
      of: [defineArrayMember({ type: "date" })],
      options: { sortable: false },
    }),
    defineField({
      name: "pickupEnabled",
      title: "Take pickup orders online",
      type: "boolean",
      description: "Switch off to pause online orders, for example if you are away or swamped. The site tells people to call instead.",
      initialValue: true,
    }),
    defineField({ name: "notificationEmail", title: "Send new orders to this email", type: "string", description: "Each pickup order is emailed here with a button to text the customer.", validation: (r) => r.email() }),
    defineField({ name: "googleRating", title: "Google rating", type: "number", description: "Type it in by hand, for example 4.9.", validation: (r) => r.min(0).max(5), initialValue: 4.9 }),
    defineField({ name: "googleReviewCount", title: "Number of Google reviews", type: "number", validation: (r) => r.min(0).integer(), initialValue: 150 }),
    defineField({ name: "googleReviewsUrl", title: "Link to your Google reviews", type: "url" }),
    defineField({ name: "instagramUrl", title: "Instagram link", type: "url", initialValue: "https://www.instagram.com/hamleys_tea_and_coffee/" }),
    defineField({
      name: "tickerLines",
      title: "Top bar messages",
      type: "array",
      description: "The little messages that scroll across the very top of the site. Type {status} on its own line to show live open or closed hours.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "payments",
      title: "Payments you take",
      type: "array",
      description: "Shown on the Visit page, for example Cash, Debit, Visa.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
  preview: { prepare: () => ({ title: "Settings" }) },
});
