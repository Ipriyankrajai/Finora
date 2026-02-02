import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Finora - Finance Clarity";
export const size = {
	width: 1200,
	height: 600,
};
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				// Dark background matching brand
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
					width: 500,
					height: 500,
					background:
						"radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)",
					top: -180,
					left: -80,
					borderRadius: "50%",
				}}
			/>

			{/* Secondary cyan orb - bottom right */}
			<div
				style={{
					position: "absolute",
					width: 400,
					height: 400,
					background:
						"radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)",
					bottom: -120,
					right: -80,
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
						width: 130,
						height: 130,
					}}
				>
					{/* Offset shadow layer - emerald accent */}
					<div
						style={{
							position: "absolute",
							width: 130,
							height: 130,
							border: "3px solid rgba(16, 185, 129, 0.4)",
							transform: "translate(10px, 10px)",
						}}
					/>
					{/* Main box */}
					<div
						style={{
							position: "absolute",
							width: 130,
							height: 130,
							border: "3px solid rgba(255, 255, 255, 0.25)",
							background: "#1a1a1f",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<span
							style={{
								fontSize: 72,
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
						gap: 6,
					}}
				>
					{/* Finora wordmark */}
					<span
						style={{
							fontSize: 68,
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
							fontSize: 18,
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
							fontSize: 22,
							color: "rgba(255, 255, 255, 0.6)",
							marginTop: 12,
							maxWidth: 480,
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
					top: 36,
					right: 36,
					width: 50,
					height: 50,
					borderTop: "2px solid rgba(16, 185, 129, 0.3)",
					borderRight: "2px solid rgba(16, 185, 129, 0.3)",
				}}
			/>

			{/* Corner accent - bottom left */}
			<div
				style={{
					position: "absolute",
					bottom: 36,
					left: 36,
					width: 50,
					height: 50,
					borderBottom: "2px solid rgba(6, 182, 212, 0.3)",
					borderLeft: "2px solid rgba(6, 182, 212, 0.3)",
				}}
			/>
		</div>,
		{
			...size,
		}
	);
}
