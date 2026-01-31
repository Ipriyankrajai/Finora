import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#fafafa",
				padding: 2,
			}}
		>
			<div
				style={{
					position: "relative",
					width: 26,
					height: 26,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* Offset shadow box */}
				<div
					style={{
						position: "absolute",
						top: 3,
						left: 3,
						width: 24,
						height: 24,
						border: "2px solid rgba(16, 185, 129, 0.5)",
					}}
				/>
				{/* Main box */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 24,
						height: 24,
						border: "2px solid #262626",
						background: "#fafafa",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span
						style={{
							fontSize: 14,
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
