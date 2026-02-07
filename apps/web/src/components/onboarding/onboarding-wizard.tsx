"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

const stepIndicatorKeys = [
	"dot-welcome",
	"dot-expenses",
	"dot-loans",
	"dot-setup",
];

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
				? "-translate-x-8 opacity-0"
				: "translate-x-8 opacity-0";
		}
		return "translate-x-0 opacity-100";
	}

	function renderStep() {
		switch (currentStep) {
			case "welcome":
				return <StepWelcome onNext={handleNext} />;
			case "expenses":
				return <StepExpenses onNext={handleNext} />;
			case "loans":
				return <StepLoans onNext={handleNext} />;
			case "setup":
				return (
					<StepSetup
						defaultCurrency={userSettings?.currencySymbol ?? "$"}
						defaultName={userSettings?.name ?? ""}
					/>
				);
			default:
				return null;
		}
	}

	return (
		<div className="relative">
			{/* Skip button */}
			<div className="mb-6 flex items-center justify-between">
				{/* Progress indicator */}
				<div className="flex gap-2">
					{stepIndicatorKeys.map((key, index) => (
						<div
							className={`h-1.5 w-8 transition-all duration-300 ${
								index <= currentStepIndex
									? "bg-emerald-500"
									: "bg-foreground/10"
							}`}
							key={key}
						/>
					))}
				</div>

				<button
					className="text-muted-foreground text-xs transition-colors hover:text-foreground"
					onClick={handleSkip}
					type="button"
				>
					Skip
				</button>
			</div>

			{/* Step content with transitions */}
			<div
				className={`transition-all duration-300 ease-in-out ${getTransitionClasses()}`}
			>
				{renderStep()}
			</div>
		</div>
	);
}
