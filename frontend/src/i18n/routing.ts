import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
