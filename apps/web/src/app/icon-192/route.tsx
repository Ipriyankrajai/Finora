import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#fafafa",
				padding: 16,
			}}
		>
			<div
				style={{
					position: "relative",
					width: 150,
					height: 150,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Offset shadow box */}
				<div
					style={{
						position: "absolute",
						top: 14,
						left: 14,
						width: 136,
						height: 136,
						border: "4px solid rgba(16, 185, 129, 0.5)",
					}}
				/>
				{/* Main box */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 136,
						height: 136,
						border: "4px solid #262626",
						background: "#fafafa",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span
						style={{
							fontSize: 80,
							fontWeight: 700,
							color: "#171717",
							letterSpacing: "-0.05em",
						}}
					>
						F
					</span>
				</div>
			</div>
		</div>,
		{
			width: 192,
			height: 192,
		}
	);
}
