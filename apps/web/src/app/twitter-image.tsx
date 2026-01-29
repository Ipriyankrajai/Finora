import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Finora - Finance Clarity";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
          position: "relative",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            top: -100,
            left: -100,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
            bottom: -50,
            right: -50,
            borderRadius: "50%",
          }}
        />

        {/* Logo and content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
            zIndex: 10,
          }}
        >
          {/* Logo mark */}
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
            {/* Shadow/offset layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "3px solid rgba(16, 185, 129, 0.4)",
                transform: "translate(12px, 12px)",
              }}
            />
            {/* Main box */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "3px solid rgba(255, 255, 255, 0.3)",
                background: "rgba(10, 10, 10, 0.8)",
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

          {/* Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 600,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              Finora
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Finance Clarity
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #10b981, #06b6d4, #10b981)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
