import type { MetadataRoute } from "next";

/** Web App Manifest — enables installability and a native-like experience. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EcoTrack — Carbon Footprint Awareness",
    short_name: "EcoTrack",
    description:
      "Estimate, track, and reduce your personal carbon footprint with personalized, AI-assisted insights.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    categories: ["lifestyle", "education", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
