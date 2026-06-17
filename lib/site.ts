/**
 * Canonical site URL, used for metadata, robots, and the sitemap.
 *
 * Set `NEXT_PUBLIC_SITE_URL` in the deployment environment (e.g. your Vercel
 * domain). Falls back to localhost for local development.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";
