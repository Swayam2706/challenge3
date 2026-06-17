/**
 * Canonical site URL, used for metadata, robots, and the sitemap.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this to your custom domain in production.
 *   2. `VERCEL_URL` — injected automatically by Vercel, so deployments get a
 *      correct canonical URL with zero configuration.
 *   3. localhost — for local development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
