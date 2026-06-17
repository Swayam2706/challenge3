import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Self-hosted via next/font: no runtime request to Google's CDN, so it works
// under a strict Content-Security-Policy and keeps users private.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EcoTrack — Understand, track, and reduce your carbon footprint",
    template: "%s · EcoTrack",
  },
  description:
    "EcoTrack helps you estimate your personal carbon footprint, see where it comes from, and get personalized, practical actions to reduce it.",
  applicationName: "EcoTrack",
  authors: [{ name: "EcoTrack" }],
  keywords: [
    "carbon footprint",
    "climate",
    "sustainability",
    "emissions calculator",
  ],
  openGraph: {
    title: "EcoTrack — Carbon Footprint Awareness Platform",
    description:
      "Estimate, track, and reduce your carbon footprint with personalized, AI-assisted insights.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before paint to apply the saved/system theme, preventing a flash of the
// wrong colour scheme. Allowed by the CSP's script-src 'unsafe-inline'.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('ecotrack:theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">
        {/* Keyboard users can skip straight to the main content. */}
        <a
          href="#main"
          className="sr-only sr-only-focusable absolute left-2 top-2 z-50 rounded-lg bg-brand-700 px-3 py-2 text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
