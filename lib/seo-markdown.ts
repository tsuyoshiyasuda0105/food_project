import fs from "node:fs";
import path from "node:path";

export type SeoMarkdownArticle = {
  audience: string;
  category: string;
  description: string;
  keywords: string[];
  noteUrl?: string;
  publishedAt: string;
  slug: string;
  tags: string[];
  title: string;
  sections: {
    heading: string;
    body: string;
  }[];
};

type Frontmatter = Record<string, string | string[]>;

function cleanYamlValue(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function parseFrontmatter(markdown: string): { meta: Frontmatter; body: string } {
  const source = markdown.replace(/^\uFEFF/, "");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: source };

  const meta: Frontmatter = {};
  let currentList = "";

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentList) {
      const list = meta[currentList];
      if (Array.isArray(list)) list.push(cleanYamlValue(listMatch[1]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const key = pair[1];
    const value = pair[2];

    if (value === "") {
      meta[key] = [];
      currentList = key;
    } else {
      meta[key] = cleanYamlValue(value);
      currentList = "";
    }
  }

  return { meta, body: source.slice(match[0].length) };
}

function asString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function asList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(/[,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugFromFilename(filename: string): string {
  return path
    .basename(filename, ".md")
    .replace(/^\d{4}-\d{2}-\d{2}[-_]/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBody(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/^# .+\n+/, "")
    .trim();
}

function firstParagraph(body: string): string {
  return normalizeBody(body)
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, " ").trim())
    .find((part) => part && !part.startsWith("|") && !part.startsWith("- ")) || "";
}

function sectionsFromMarkdown(body: string): SeoMarkdownArticle["sections"] {
  const lines = normalizeBody(body).split("\n");
  const sections: SeoMarkdownArticle["sections"] = [];
  let intro: string[] = [];
  let current: { heading: string; lines: string[] } | null = null;

  function flushCurrent() {
    if (!current) return;
    const text = current.lines.join("\n").trim();
    if (text) sections.push({ heading: current.heading, body: text });
    current = null;
  }

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (!current && intro.join("\n").trim()) {
        sections.push({ heading: "この記事の要点", body: intro.join("\n").trim() });
        intro = [];
      }
      flushCurrent();
      current = { heading: heading[1].trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
    else intro.push(line);
  }

  if (!current && intro.join("\n").trim()) {
    sections.push({ heading: "この記事の要点", body: intro.join("\n").trim() });
  }
  flushCurrent();

  return sections.length ? sections : [{ heading: "本文", body: normalizeBody(body) }];
}

function readMarkdownFiles(): string[] {
  const contentDir = path.resolve(process.cwd(), "content", "blog");
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((filename) => filename.endsWith(".md"))
    .sort()
    .reverse()
    .map((filename) => path.join(contentDir, filename));
}

function readArticle(filePath: string): SeoMarkdownArticle | null {
  const markdown = fs.readFileSync(filePath, "utf8");
  const { meta, body } = parseFrontmatter(markdown);
  const title = asString(meta.title);
  if (!title) return null;

  const slug = asString(meta.slug) || slugFromFilename(filePath);
  const publishedAt = asString(meta.publishedAt) || asString(meta.date) || path.basename(filePath).slice(0, 10);
  const category = asString(meta.category) || "SEO";
  const description = asString(meta.description) || firstParagraph(body).slice(0, 150);
  const keywords = asList(meta.keywords);
  const tags = asList(meta.tags);

  return {
    audience: asString(meta.audience) || category,
    category,
    description,
    keywords: keywords.length ? keywords : tags,
    noteUrl: asString(meta.noteUrl) || undefined,
    publishedAt,
    slug,
    tags,
    title,
    sections: sectionsFromMarkdown(body),
  };
}

export function getGeneratedSeoArticles(): SeoMarkdownArticle[] {
  return readMarkdownFiles().flatMap((filePath) => {
    const article = readArticle(filePath);
    return article ? [article] : [];
  });
}

export function getGeneratedBlogArticles() {
  return getGeneratedSeoArticles().map((article) => ({
    href: `/seo/${article.slug}`,
    label: article.category || "SEO",
    title: article.title,
    text: article.description,
  }));
}
