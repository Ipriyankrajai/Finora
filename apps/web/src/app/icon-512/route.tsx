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
				padding: 48,
			}}
		>
			<div
				style={{
					position: "relative",
					width: 400,
					height: 400,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Offset shadow box */}
				<div
					style={{
						position: "absolute",
						top: 32,
						left: 32,
						width: 360,
						height: 360,
						border: "8px solid rgba(16, 185, 129, 0.5)",
					}}
				/>
				{/* Main box */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 360,
						height: 360,
						border: "8px solid #262626",
						background: "#fafafa",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span
						style={{
							fontSize: 200,
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
			width: 512,
			height: 512,
		}
	);
}
