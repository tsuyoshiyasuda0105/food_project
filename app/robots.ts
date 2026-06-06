import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/lp"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
