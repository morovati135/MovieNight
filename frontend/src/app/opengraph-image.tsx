import { ImageResponse } from "next/og";

export const alt = "MovieNight: discover, pick and save movies for your next movie night";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The social-preview card shown when a link to MovieNight is shared. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #030a1b 0%, #061a3a 55%, #3a0f2e 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "0 96px",
          width: "100%",
        }}
      >
        <div style={{ color: "#4fb8f2", display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase" }}>
          Movie night, sorted
        </div>
        <div style={{ display: "flex", fontSize: 128, fontWeight: 800, letterSpacing: -4, marginTop: 16 }}>MovieNight</div>
        <div style={{ color: "rgba(255,255,255,0.78)", display: "flex", fontSize: 38, marginTop: 24 }}>
          Discover, pick and save movies for your next movie night.
        </div>
      </div>
    ),
    size,
  );
}
