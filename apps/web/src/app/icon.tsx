import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "#10b981",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          position: "relative",
        }}
      >
        {/* Offset shadow box */}
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: -3,
            bottom: -3,
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: 4,
          }}
        />
        {/* Letter */}
        <span
          style={{
            color: "white",
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          F
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
