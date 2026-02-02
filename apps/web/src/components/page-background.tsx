"use client";

export function FloatingOrb({
	className,
	delay = "0s",
}: {
	className?: string;
	delay?: string;
}) {
	return (
		<div
			className={`absolute rounded-full opacity-15 blur-[100px] dark:opacity-25 ${className}`}
			style={{
				animation: "float 15s ease-in-out infinite",
				animationDelay: delay,
			}}
		/>
	);
}

export function GridPattern() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
					backgroundSize: "60px 60px",
				}}
			/>
		</div>
	);
}

export function GradientMesh() {
	return (
		<div
			className="pointer-events-none absolute inset-0 opacity-30"
			style={{
				backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
			}}
		/>
	);
}

export function PageBackground({
	variant = "default",
}: {
	variant?: "default" | "centered" | "top-heavy";
}) {
	const orbConfigs = {
		default: [
			{
				className: "w-[500px] h-[500px] bg-emerald-500 -top-40 -left-40",
				delay: "0s",
			},
			{
				className: "w-[400px] h-[400px] bg-cyan-500 top-1/2 -right-40",
				delay: "3s",
			},
			{
				className: "w-[300px] h-[300px] bg-emerald-400 bottom-20 left-1/4",
				delay: "6s",
			},
		],
		centered: [
			{
				className: "w-[400px] h-[400px] bg-emerald-500 top-20 -left-20",
				delay: "0s",
			},
			{
				className: "w-[350px] h-[350px] bg-cyan-500 top-40 -right-20",
				delay: "2s",
			},
			{
				className: "w-[250px] h-[250px] bg-emerald-400 bottom-40 left-1/3",
				delay: "4s",
			},
		],
		"top-heavy": [
			{
				className: "w-[450px] h-[450px] bg-emerald-500 -top-20 left-1/4",
				delay: "0s",
			},
			{
				className: "w-[350px] h-[350px] bg-cyan-500 top-20 -right-20",
				delay: "3s",
			},
			{
				className: "w-[200px] h-[200px] bg-emerald-400 top-1/3 -left-10",
				delay: "5s",
			},
		],
	};

	const orbs = orbConfigs[variant];

	return (
		<>
			<GridPattern />
			{orbs.map((orb) => (
				<FloatingOrb
					className={orb.className}
					delay={orb.delay}
					key={orb.delay}
				/>
			))}
			<GradientMesh />
		</>
	);
}
