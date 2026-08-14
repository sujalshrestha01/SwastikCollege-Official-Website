import { Helmet } from "react-helmet-async";

/**
 * Site-wide defaults. SITE_URL should be updated to the real production
 * domain before going live (also update it in index.html, robots.txt,
 * sitemap generation and vercel.json if you add redirects).
 */
export const SITE_URL = "https://www.swastikcollege.edu.np";
export const SITE_NAME = "Swastik College";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Drop this at the top of any page component to control that page's
 * <title>, meta description, canonical URL, Open Graph / Twitter tags and
 * (optionally) JSON-LD structured data.
 *
 * Usage:
 *   <SEO
 *     title="Academic Programs"
 *     description="Explore BSc. CSIT and BCA programs at Swastik College..."
 *     path="/programs"
 *   />
 */
export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  keywords,
  noindex = false,
  jsonLd,
  type = "website",
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}`;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large"
        }
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && (
        <meta property="og:description" content={description} />
      )}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
