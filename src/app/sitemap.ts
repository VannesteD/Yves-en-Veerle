import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date("2026-08-26T00:00:00.000Z");
  return [
    { url: new URL("/", base).toString(), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/shop", base).toString(), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: new URL("/privacy", base).toString(), lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
