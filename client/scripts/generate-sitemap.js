// Generates public/sitemap.xml before every build.
//
// Static routes are always included. Course and blog pages are pulled live
// from the API so new programs/posts show up in the sitemap automatically —
// if the API can't be reached (e.g. running a build with no backend up),
// the script just falls back to the static routes instead of failing the
// build.
//
// Run manually with: npm run sitemap

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://www.swastikcollege.edu.np";
const API_URL = process.env.VITE_API_URL || "http://localhost:5000/api";

const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/programs", changefreq: "weekly", priority: "0.9" },
  { path: "/programs/non-credit", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/faculty", changefreq: "monthly", priority: "0.6" },
  { path: "/notices", changefreq: "daily", priority: "0.8" },
  { path: "/downloads", changefreq: "weekly", priority: "0.5" },
  { path: "/gallery", changefreq: "monthly", priority: "0.5" },
  { path: "/blog", changefreq: "daily", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.7" },
];

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function urlEntry({ path, changefreq, priority }) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const entries = [...staticRoutes];

  const courses = await safeFetchJson(`${API_URL}/courses`);
  if (Array.isArray(courses)) {
    for (const c of courses) {
      if (c?.slug) {
        entries.push({
          path: `/programs/${c.slug}`,
          changefreq: "monthly",
          priority: "0.7",
        });
      }
    }
  }

  const blogs = await safeFetchJson(`${API_URL}/blogs`);
  const blogList = Array.isArray(blogs) ? blogs : blogs?.items;
  if (Array.isArray(blogList)) {
    for (const b of blogList) {
      const slug = b?.slug || b?._id;
      if (slug) {
        entries.push({
          path: `/blog/${slug}`,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>
`;

  const outPath = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(
    `sitemap.xml written with ${entries.length} URLs (${courses ? courses.length : 0} courses, ${blogList ? blogList.length : 0} blog posts).`,
  );
}

main();
