import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
	width: 180,
	height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
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
					width: 140,
					height: 140,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Offset shadow box */}
				<div
					style={{
						position: "absolute",
						top: 16,
						left: 16,
						width: 128,
						height: 128,
						border: "4px solid rgba(16, 185, 129, 0.5)",
					}}
				/>
				{/* Main box */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 128,
						height: 128,
						border: "4px solid #262626",
						background: "#fafafa",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span
						style={{
							fontSize: 72,
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
			...size,
		}
	);
}
