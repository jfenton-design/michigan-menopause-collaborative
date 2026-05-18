import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Michigan Menopause Collaborative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Bloom mark (no text) encoded as a data URL so Satori renders it reliably
const BLOOM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="-65 -65 130 130">
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(0)"/>
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(60)"/>
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(120)"/>
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(180)"/>
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(240)"/>
  <path d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z" fill="#8A65E0" transform="rotate(300)"/>
  <circle r="30" fill="none" stroke="#F7F4FB" stroke-width="1.8"/>
</svg>`;

const BLOOM_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(BLOOM_SVG).toString("base64")}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1F1535",
        }}
      >
        {/* Bloom mark with MMC centered on top */}
        <div style={{ position: "relative", width: 180, height: 180, display: "flex" }}>
          <img src={BLOOM_DATA_URL} width={180} height={180} />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F7F4FB",
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            MMC
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            marginTop: 40,
            color: "#F7F4FB",
            fontSize: 58,
            fontWeight: 600,
            letterSpacing: "-1.5px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Michigan Menopause Collaborative
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 20,
            color: "#8A65E0",
            fontSize: 28,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "4px",
          }}
        >
          MICHIGANMENOPAUSE.COM
        </div>
      </div>
    ),
    { ...size }
  );
}
