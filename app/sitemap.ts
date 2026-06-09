import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");
const seoSlugs = [
  "restaurant-food-cost",
  "supermarket-buyer",
  "farmer-selling-price",
  "rice-price-report",
  "minpaku-tourism-demand",
  "weather-food-price",
  "household-food-price"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    ...seoSlugs.map((slug) => ({
      url: `${baseUrl}/seo/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.72
    }))
  ];
}
