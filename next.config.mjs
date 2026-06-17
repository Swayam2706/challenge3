/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Security headers applied to every response. These mitigate common web
// vulnerabilities (clickjacking, MIME sniffing, referrer leakage) and define a
// strict Content-Security-Policy. Keeping this in one place makes the security
// posture auditable.
//
// In production, script-src is strict: only same-origin and the small inline
// bootstrap scripts Next.js requires. In development we additionally allow
// 'unsafe-eval' because Next.js's Fast Refresh (hot reloading) relies on it;
// this relaxation never ships to production.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Tree-shake large icon/chart packages so only used modules are bundled,
  // reducing First Load JS.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
