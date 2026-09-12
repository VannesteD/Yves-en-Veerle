import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Slagerij - Traiteur Yves & Veerle",
    short_name: "Yves & Veerle",
    description: "Vers vlees, charcuterie en huisbereide specialiteiten in Menen.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#0f0f0f",
    lang: "nl-BE",
    icons: [{ src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" }],
  };
}
