import type { VercelRequest, VercelResponse } from "@vercel/node";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";

// Crawl settings
const DEFAULT_MAX_PAGES = 100;
const DEFAULT_MAX_DEPTH = 3;
const REQUEST_TIMEOUT_MS = 15000;
const CONCURRENCY = 4;

interface CrawlPage {
  url: string;
  title?: string;
  description?: string;
  headings?: { h1?: string; h2?: string[] };
}

interface CrawlResult {
  domainUrl: string;
  pages: CrawlPage[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const domainUrl = (req.query.url as string) || "";
    if (!domainUrl) return res.status(400).json({ error: "Missing url" });

    const maxPages = parseInt((req.query.maxPages as string) || "", 10) || DEFAULT_MAX_PAGES;
    const maxDepth = parseInt((req.query.maxDepth as string) || "", 10) || DEFAULT_MAX_DEPTH;

    const base = normalizeBase(domainUrl);

    const robotsRules = await fetchRobots(base).catch(() => ({ disallow: [] as string[] }));
    const sitemapUrls = await fetchSitemaps(base).catch(() => [] as string[]);

    const discovered = new Set<string>([base]);
    for (const u of sitemapUrls) discovered.add(u);

    const pages: CrawlPage[] = [];

    const queue: Array<{ url: string; depth: number }> = Array.from(discovered).map((u) => ({ url: u, depth: 0 }));

    const isAllowed = (url: string) => {
      try {
        const u = new URL(url);
        if (!sameOrigin(u.origin, base)) return false;
        const path = u.pathname;
        return !robotsRules.disallow.some((p) => path.startsWith(p));
      } catch {
        return false;
      }
    };

    const enqueueLinks = (fromUrl: string, rawHtml: string, depth: number) => {
      if (depth >= maxDepth) return;
      const $ = cheerio.load(rawHtml);
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          const abs = new URL(href, fromUrl).toString();
          if (!isAllowed(abs)) return;
          if (!discovered.has(abs) && pages.length + queue.length < maxPages) {
            discovered.add(abs);
            queue.push({ url: abs, depth: depth + 1 });
          }
        } catch {}
      });
    };

    const fetchWithTimeout = async (url: string) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "GraceCrawler/1.0 (+https://example.com)" } });
        const html = await res.text();
        return { ok: res.ok, status: res.status, html, headers: res.headers };
      } finally {
        clearTimeout(id);
      }
    };

    const workers: Promise<void>[] = [];
    for (let i = 0; i < CONCURRENCY; i += 1) {
      workers.push(
        (async () => {
          while (pages.length < maxPages) {
            const job = queue.shift();
            if (!job) break;
            if (!isAllowed(job.url)) continue;

            try {
              const resp = await fetchWithTimeout(job.url);
              if (!resp.ok) continue;

              const page: CrawlPage = extractPageMeta(job.url, resp.html);
              pages.push(page);

              enqueueLinks(job.url, resp.html, job.depth);
            } catch {
              // ignore
            }
          }
        })()
      );
    }

    await Promise.race([
      Promise.all(workers),
      new Promise((resolve) => setTimeout(resolve, 20000)),
    ]);

    const uniquePages = dedupeByUrl(pages).slice(0, maxPages);

    const result: CrawlResult = { domainUrl: base, pages: uniquePages };
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}

function dedupeByUrl(list: CrawlPage[]): CrawlPage[] {
  const seen = new Set<string>();
  const out: CrawlPage[] = [];
  for (const p of list) {
    if (seen.has(p.url)) continue;
    seen.add(p.url);
    out.push(p);
  }
  return out;
}

function extractPageMeta(url: string, html: string): CrawlPage {
  const $ = cheerio.load(html);
  const title = ($("title").first().text() || undefined)?.trim();
  const description = ($('meta[name="description"]').attr("content") || undefined)?.trim();
  const h1 = ($("h1").first().text() || undefined)?.trim();
  const h2: string[] = [];
  $("h2").each((_, el) => {
    const t = $(el).text().trim();
    if (t) h2.push(t);
  });
  return { url, title, description, headings: { h1, h2 } };
}

function normalizeBase(input: string): string {
  const u = new URL(input);
  u.hash = "";
  u.search = "";
  if (!u.pathname.endsWith("/")) u.pathname = u.pathname + "/";
  return u.toString();
}

function sameOrigin(origin: string, base: string): boolean {
  try {
    const a = new URL(origin);
    const b = new URL(base);
    return a.origin === b.origin;
  } catch {
    return false;
  }
}

async function fetchRobots(baseUrl: string): Promise<{ disallow: string[] }> {
  try {
    const u = new URL("/robots.txt", baseUrl).toString();
    const res = await fetch(u, { headers: { "User-Agent": "GraceCrawler/1.0" } });
    const text = await res.text();
    return parseRobots(text);
  } catch {
    return { disallow: [] };
  }
}

function parseRobots(text: string): { disallow: string[] } {
  const lines = text.split(/\r?\n/);
  const disallow: string[] = [];
  let applies = false;
  for (const line of lines) {
    const l = line.trim();
    if (!l || l.startsWith("#")) continue;
    const [keyRaw, valueRaw] = l.split(":", 2);
    const key = keyRaw?.trim().toLowerCase();
    const value = (valueRaw || "").trim();
    if (key === "user-agent") {
      applies = value === "*"; // simple: only consider * block
    } else if (applies && key === "disallow") {
      if (value) disallow.push(value);
    }
  }
  return { disallow };
}

async function fetchSitemaps(baseUrl: string): Promise<string[]> {
  const out = new Set<string>();
  // robots.txt may include Sitemap:
  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).toString();
    const res = await fetch(robotsUrl);
    const text = await res.text();
    const regex = /Sitemap:\s*(.+)/gi;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      const sitemapUrl = m[1].trim();
      for (const url of await parseSitemapToUrls(sitemapUrl)) out.add(url);
    }
  } catch {}

  // common locations
  for (const path of ["/sitemap.xml", "/sitemap_index.xml"]) {
    try {
      const u = new URL(path, baseUrl).toString();
      const urls = await parseSitemapToUrls(u);
      for (const url of urls) out.add(url);
    } catch {}
  }

  return Array.from(out).filter((u) => sameOrigin(u, baseUrl));
}

async function parseSitemapToUrls(sitemapUrl: string): Promise<string[]> {
  try {
    const res = await fetch(sitemapUrl);
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    const urls: string[] = [];

    if (data.urlset && Array.isArray(data.urlset.url)) {
      for (const item of data.urlset.url) {
        if (typeof item.loc === "string") urls.push(item.loc);
        else if (item.loc && typeof item.loc["#text"] === "string") urls.push(item.loc["#text"]);
      }
    } else if (data.sitemapindex && Array.isArray(data.sitemapindex.sitemap)) {
      for (const sm of data.sitemapindex.sitemap) {
        const child = typeof sm.loc === "string" ? sm.loc : sm.loc?.["#text"];
        if (child) {
          const inner = await parseSitemapToUrls(child);
          for (const u of inner) urls.push(u);
        }
      }
    }

    return urls;
  } catch {
    return [];
  }
}
