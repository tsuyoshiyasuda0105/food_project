import type { MetadataRoute } from "next";
import { getGeneratedSeoArticles } from "@/lib/seo-markdown";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");
const seoSlugs = [
  "restaurant-food-cost",
  "supermarket-buyer",
  "farmer-selling-price",
  "rice-price-report",
  "meat-price-report",
  "minpaku-tourism-demand",
  "weather-food-price",
  "household-food-price",
  "rice-price-procurement"
];

const generatedSeoSlugs = getGeneratedSeoArticles().map((article) => article.slug);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/lp`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    ...[...new Set([...seoSlugs, ...generatedSeoSlugs])].map((slug) => ({
      url: `${baseUrl}/seo/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.72
    }))
  ];
}
