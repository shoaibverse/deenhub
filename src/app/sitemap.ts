import type { MetadataRoute } from "next";
import { getCollections } from "@/lib/hadith/service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/quran", priority: 0.9 },
    { path: "/quran/search", priority: 0.7 },
    { path: "/hadith", priority: 0.9 },
    { path: "/duas", priority: 0.9 },
    { path: "/prayer", priority: 0.8 },
    { path: "/qibla", priority: 0.7 },
    { path: "/calendar", priority: 0.7 },
    { path: "/tasbeeh", priority: 0.7 },
    { path: "/zakat", priority: 0.8 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.4 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/disclaimer", priority: 0.3 },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  for (let surah = 1; surah <= 114; surah += 1) {
    entries.push({
      url: `${siteUrl}/quran/${surah}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    entries.push({
      url: `${siteUrl}/quran/${surah}/tafsir`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  for (const collection of getCollections()) {
    entries.push({
      url: `${siteUrl}/hadith/${collection.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
