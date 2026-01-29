import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Finora - Finance Clarity";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Dark background matching brand: oklch(0.141 0.005 285.823)
          background: "#1a1a1f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Primary emerald gradient orb - top left */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)",
            top: -200,
            left: -100,
            borderRadius: "50%",
          }}
        />

        {/* Secondary cyan orb - bottom right */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)",
            bottom: -150,
            right: -100,
            borderRadius: "50%",
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            zIndex: 10,
          }}
        >
          {/* Logo mark - exact brand treatment */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: 140,
              height: 140,
            }}
          >
            {/* Offset shadow layer - emerald accent */}
            <div
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                border: "3px solid rgba(16, 185, 129, 0.4)",
                transform: "translate(12px, 12px)",
              }}
            />
            {/* Main box */}
            <div
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                border: "3px solid rgba(255, 255, 255, 0.25)",
                background: "#1a1a1f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 80,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.05em",
                }}
              >
                F
              </span>
            </div>
          </div>

          {/* Wordmark and tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Finora wordmark */}
            <span
              style={{
                fontSize: 72,
                fontWeight: 600,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Finora
            </span>

            {/* Subtitle */}
            <span
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              Finance Clarity
            </span>

            {/* Tagline */}
            <span
              style={{
                fontSize: 24,
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: 16,
                maxWidth: 500,
                lineHeight: 1.4,
              }}
            >
              Track expenses, manage income, and gain financial insights
            </span>
          </div>
        </div>

        {/* Bottom accent bar - brand gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, #10b981, #06b6d4, #10b981)",
          }}
        />

        {/* Corner accent - top right */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 60,
            height: 60,
            borderTop: "2px solid rgba(16, 185, 129, 0.3)",
            borderRight: "2px solid rgba(16, 185, 129, 0.3)",
          }}
        />

        {/* Corner accent - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            width: 60,
            height: 60,
            borderBottom: "2px solid rgba(6, 182, 212, 0.3)",
            borderLeft: "2px solid rgba(6, 182, 212, 0.3)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
