/**
 * Large decorative bloom mark — used as a background watermark on
 * Meetings, Leadership, and Resources pages. Positioned to the right,
 * partially clipped for visual depth.
 */
export function BloomWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        right: "-220px",
        transform: "translateY(-42%)",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.055,
      }}
    >
      <svg
        width="680"
        height="680"
        viewBox="-65 -65 130 130"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path
            key={a}
            d="M 0 -56 C 6 -52 9 -44 8 -39 C 7 -35 4 -32 0 -32 C -4 -32 -7 -35 -8 -39 C -9 -44 -6 -52 0 -56 Z"
            fill="#6B3FCB"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="30" fill="none" stroke="#6B3FCB" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
