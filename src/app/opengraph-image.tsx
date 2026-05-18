import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Michigan Menopause Collaborative";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        {/* Bloom mark — 6 petals */}
        <svg width="120" height="120" viewBox="-65 -65 130 130" xmlns="http://www.w3.org/2000/svg">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path
              key={a}
              d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z"
              fill="#8A65E0"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="30" fill="none" stroke="#F7F4FB" strokeWidth="1.8" />
          <text
            y="6.5"
            textAnchor="middle"
            fontFamily="system-ui,sans-serif"
            fontWeight="600"
            fontSize="19"
            letterSpacing="-0.5"
            fill="#F7F4FB"
          >
            MMC
          </text>
        </svg>

        {/* Wordmark */}
        <div
          style={{
            marginTop: 32,
            color: "#F7F4FB",
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            fontFamily: "system-ui,sans-serif",
          }}
        >
          Michigan Menopause Collaborative
        </div>
        <div
          style={{
            marginTop: 16,
            color: "#8A65E0",
            fontSize: 22,
            fontFamily: "system-ui,sans-serif",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          michiganmenopause.com
        </div>
      </div>
    ),
    { ...size }
  );
}
