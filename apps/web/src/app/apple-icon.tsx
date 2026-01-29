import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
          position: "relative",
        }}
      >
        {/* Offset shadow box */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: -16,
            bottom: -16,
            border: "4px solid rgba(255,255,255,0.25)",
            borderRadius: 28,
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
