import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 80,
          position: "relative",
        }}
      >
        {/* Offset shadow box */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: -32,
            bottom: -32,
            border: "8px solid rgba(255,255,255,0.25)",
            borderRadius: 72,
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
      width: 512,
      height: 512,
    }
  );
}
