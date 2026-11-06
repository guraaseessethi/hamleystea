import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

/** Documents the owner edits in place. They are never created from the "+" menu. */
const SINGLETONS = ["siteSettings", "homePage"];
/** Orders arrive from the website, not from the Studio. */
const SYSTEM_MADE = ["pickupOrder"];

export default defineConfig({
  name: "default",
  title: "Hamley's Tea & Coffee",
  projectId: "a5yzz6tx",
  dataset: "production",
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter((t) => ![...SINGLETONS, ...SYSTEM_MADE].includes(t.schemaType)),
  },
  document: {
    actions: (input, context) =>
      SINGLETONS.includes(context.schemaType)
        ? input.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action))
        : SYSTEM_MADE.includes(context.schemaType)
          ? input.filter(({ action }) => action && !["duplicate"].includes(action))
          : input,
  },
});
