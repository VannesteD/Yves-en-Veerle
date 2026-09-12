import { ImageResponse } from "next/og";

export const alt = "Slagerij - Traiteur Yves & Veerle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "#0f0f0f", color: "#c9a227", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: 80, textAlign: "center", width: "100%" }}>
      <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase" }}>Slagerij - Traiteur</div>
      <div style={{ color: "#faf8f5", fontSize: 88, fontWeight: 700, marginTop: 28 }}>Yves &amp; Veerle</div>
      <div style={{ fontSize: 30, marginTop: 36 }}>Huisbereide passie, geserveerd met een glimlach.</div>
    </div>,
    size,
  );
}
