"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import {
	useCompleteOnboarding,
	useUserSettings,
} from "@/hooks/use-user-settings";

import { StepExpenses } from "./step-expenses";
import { StepLoans } from "./step-loans";
import { StepSetup } from "./step-setup";
import { StepWelcome } from "./step-welcome";

const STEPS = ["welcome", "expenses", "loans", "setup"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
	welcome: "Welcome",
	expenses: "Expenses",
	loans: "Loans",
	setup: "Profile",
};

export function OnboardingWizard() {
	const router = useRouter();
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [direction, setDirection] = useState<"forward" | "backward">("forward");
	const [isTransitioning, setIsTransitioning] = useState(false);
	const completeOnboarding = useCompleteOnboarding();
	const { data: userSettings } = useUserSettings();

	const currentStep: Step = STEPS[currentStepIndex];

	function handleNext() {
		if (currentStepIndex < STEPS.length - 1) {
			setDirection("forward");
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStepIndex((prev) => prev + 1);
				setIsTransitioning(false);
			}, 300);
		}
	}

	function handleBack() {
		if (currentStepIndex > 0) {
			setDirection("backward");
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentStepIndex((prev) => prev - 1);
				setIsTransitioning(false);
			}, 300);
		}
	}

	async function handleSkip() {
		try {
			await completeOnboarding.mutateAsync();
			router.push("/dashboard");
		} catch {
			toast.error("Something went wrong. Please try again.");
		}
	}

	function getTransitionClasses(): string {
		if (isTransitioning) {
			return direction === "forward"
				? "-translate-x-8 opacity-0 scale-[0.98]"
				: "translate-x-8 opacity-0 scale-[0.98]";
		}
		return "translate-x-0 opacity-100 scale-100";
	}

	function renderStep() {
		switch (currentStep) {
			case "welcome":
				return <StepWelcome onNext={handleNext} />;
			case "expenses":
				return <StepExpenses onBack={handleBack} onNext={handleNext} />;
			case "loans":
				return <StepLoans onBack={handleBack} onNext={handleNext} />;
			case "setup":
				return (
					<StepSetup
						defaultCurrency={userSettings?.currencyCode ?? "USD"}
						defaultName={userSettings?.name ?? ""}
						onBack={handleBack}
					/>
				);
			default:
				return null;
		}
	}

	return (
		<div className="relative">
			{/* Header: Logo + Skip */}
			<div className="mb-8 flex items-center justify-between">
				<Logo asLink={false} showSubtitle={false} size="sm" />

				<button
					className="group flex items-center gap-1.5 text-muted-foreground text-xs tracking-wide transition-colors hover:text-foreground"
					onClick={handleSkip}
					type="button"
				>
					Skip setup
					<span className="inline-block transition-transform group-hover:translate-x-0.5">
						&rarr;
					</span>
				</button>
			</div>

			{/* Stepper */}
			<div className="mb-10">
				{/* Step labels */}
				<div className="mb-3 flex items-center justify-between">
					{STEPS.map((step, index) => (
						<div className="flex items-center gap-1.5" key={`label-${step}`}>
							{/* Step number */}
							<span
								className={`flex size-5 items-center justify-center border font-medium text-[10px] transition-all duration-500 ${
									index <= currentStepIndex
										? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400"
										: "border-border bg-foreground/5 text-muted-foreground"
								}`}
							>
								{index + 1}
							</span>
							{/* Label — only show on md+ */}
							<span
								className={`hidden text-[10px] uppercase tracking-[0.15em] transition-colors duration-500 md:inline ${
									index <= currentStepIndex
										? "text-foreground/80"
										: "text-muted-foreground/50"
								}`}
							>
								{STEP_LABELS[step]}
							</span>
						</div>
					))}
				</div>

				{/* Progress track */}
				<div className="relative h-px w-full bg-border">
					<div
						className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-700 ease-out"
						style={{
							width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
						}}
					/>
					{/* Glow */}
					<div
						className="absolute top-0 left-0 h-px bg-emerald-400 blur-[2px] transition-all duration-700 ease-out"
						style={{
							width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
						}}
					/>
				</div>
			</div>

			{/* Step content with transitions — min-h prevents header jump between steps */}
			<div
				className={`min-h-[480px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${getTransitionClasses()}`}
			>
				{renderStep()}
			</div>
		</div>
	);
}
