import type { Metadata } from "next";

import { RecurringPageClient } from "@/components/recurring/recurring-page-client";

export const metadata: Metadata = {
	title: "Recurring",
	description: "Manage your recurring income and expense rules.",
};

export default function RecurringPage() {
	return <RecurringPageClient />;
}
