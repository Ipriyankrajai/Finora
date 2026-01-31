import type { Metadata } from "next";

import { LoanDetailPage } from "@/components/loans/loan-detail-page";

export const metadata: Metadata = {
	title: "Loan Details",
	description: "View loan details and payment history.",
};

interface LoanDetailPageRouteProps {
	params: Promise<{ id: string }>;
}

/**
 * Dynamic route for viewing a single loan with details and payment history.
 * Renders the LoanDetailPage client component.
 */
export default async function LoanDetailPageRoute({
	params,
}: LoanDetailPageRouteProps) {
	const { id } = await params;
	return <LoanDetailPage loanId={id} />;
}
