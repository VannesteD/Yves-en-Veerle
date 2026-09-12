export const SITE_NAME = "Slagerij - Traiteur Yves & Veerle";
export const SITE_DESCRIPTION = "Huisbereide passie en ambachtelijke specialiteiten van Slagerij - Traiteur Yves & Veerle in Menen.";

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(configured || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}
