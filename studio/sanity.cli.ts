import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "a5yzz6tx",
    dataset: "production",
  },
  // Hosted Studio address: https://hamleys.sanity.studio (run `npm run deploy` once, signed in to Sanity)
  studioHost: "hamleys",
});
