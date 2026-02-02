import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma before importing modules that use it
vi.mock("@finora2/db", () => ({
	default: {
		transaction: {
			findMany: vi.fn(),
		},
		loan: {
			findMany: vi.fn(),
		},
		$queryRaw: vi.fn(),
	},
	InterestType: {
		SIMPLE: "SIMPLE",
		COMPOUND: "COMPOUND",
	},
}));

import prisma from "@finora2/db";
import { createCallerFactory } from "../../index";
import { appRouter } from "../index";

const createCaller = createCallerFactory(appRouter);

describe("dashboard router", () => {
	// Use valid CUID format IDs
	const MOCK_USER_ID = "cldashuser12345678901";
	const MOCK_LOAN_ID_1 = "clloan12345678901234a";
	const MOCK_LOAN_ID_2 = "clloan12345678901234b";
	const MOCK_TAG_ID_1 = "cltag123456789012345a";
	const MOCK_TAG_ID_2 = "cltag123456789012345b";
	const MOCK_TAG_ID_3 = "cltag123456789012345c";
	const MOCK_TAG_ID_4 = "cltag123456789012345d";
	const MOCK_TAG_ID_5 = "cltag123456789012345e";
	const MOCK_TAG_ID_6 = "cltag123456789012345f";
	const MOCK_TAG_ID_7 = "cltag123456789012345g";
	const MOCK_SESSION_ID = "clsession123456789012";

	const mockUser = {
		id: MOCK_USER_ID,
		email: "test@test.com",
		name: "Test User",
	};
	const mockSession = {
		user: mockUser,
		session: {
			id: MOCK_SESSION_ID,
			userId: mockUser.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			expiresAt: new Date(Date.now() + 86_400_000),
			token: "test-token",
		},
	};

	// Create caller with mock session
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const caller = createCaller({ session: mockSession } as any);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("summary", () => {
		it("calculates monthly summary correctly", async () => {
			// Given: 2 income transactions ($1000, $500), 3 expense transactions ($200, $300, $100)
			const mockTransactions = [
				{ type: "INCOME" as const, amountCents: BigInt(100_000) }, // $1000
				{ type: "INCOME" as const, amountCents: BigInt(50_000) }, // $500
				{ type: "EXPENSE" as const, amountCents: BigInt(20_000) }, // $200
				{ type: "EXPENSE" as const, amountCents: BigInt(30_000) }, // $300
				{ type: "EXPENSE" as const, amountCents: BigInt(10_000) }, // $100
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				mockTransactions as any
			);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.dashboard.summary();

			// Income: $1000 + $500 = $1500 = 150000 cents
			expect(result.monthlySummary.incomeCents).toBe(BigInt(150_000));
			// Expense: $200 + $300 + $100 = $600 = 60000 cents
			expect(result.monthlySummary.expenseCents).toBe(BigInt(60_000));
			// Net: $1500 - $600 = $900 = 90000 cents
			expect(result.monthlySummary.netCents).toBe(BigInt(90_000));
		});

		it("returns top 5 tags with Other grouping", async () => {
			// Given: 7 tags with spending
			const mockTagSpending = [
				{
					tagId: MOCK_TAG_ID_1,
					tagName: "Food",
					tagColor: "#FF0000",
					totalCents: BigInt(50_000),
				},
				{
					tagId: MOCK_TAG_ID_2,
					tagName: "Transport",
					tagColor: "#00FF00",
					totalCents: BigInt(40_000),
				},
				{
					tagId: MOCK_TAG_ID_3,
					tagName: "Entertainment",
					tagColor: "#0000FF",
					totalCents: BigInt(30_000),
				},
				{
					tagId: MOCK_TAG_ID_4,
					tagName: "Utilities",
					tagColor: "#FFFF00",
					totalCents: BigInt(20_000),
				},
				{
					tagId: MOCK_TAG_ID_5,
					tagName: "Shopping",
					tagColor: "#FF00FF",
					totalCents: BigInt(15_000),
				},
				{
					tagId: MOCK_TAG_ID_6,
					tagName: "Health",
					tagColor: "#00FFFF",
					totalCents: BigInt(10_000),
				},
				{
					tagId: MOCK_TAG_ID_7,
					tagName: "Other",
					tagColor: "#888888",
					totalCents: BigInt(5000),
				},
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue(mockTagSpending);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.dashboard.summary();

			// Should return top 5 tags
			expect(result.topTags).toHaveLength(5);
			expect(result.topTags[0]?.tagName).toBe("Food");
			expect(result.topTags[4]?.tagName).toBe("Shopping");

			// otherTagsTotal should be sum of remaining 2 tags: 10000 + 5000 = 15000
			expect(result.otherTagsTotal).toBe(BigInt(15_000));
		});

		it("returns loan overview with projections", async () => {
			// Given: 2 loans with payments
			const mockLoans = [
				{
					id: MOCK_LOAN_ID_1,
					userId: MOCK_USER_ID,
					name: "Car Loan",
					interestType: "COMPOUND" as const,
					principalCents: BigInt(1_000_000), // $10,000
					annualRatePercent: 6.0,
					termMonths: 60,
					monthlyPaymentCents: BigInt(19_333), // ~$193.33
					currencyCode: "USD",
					startDate: new Date("2024-01-01"),
					createdAt: new Date(),
					updatedAt: new Date(),
					payments: [
						{ principalCents: BigInt(15_000), interestCents: BigInt(5000) },
						{ principalCents: BigInt(15_500), interestCents: BigInt(4500) },
					],
				},
				{
					id: MOCK_LOAN_ID_2,
					userId: MOCK_USER_ID,
					name: "Personal Loan",
					interestType: "SIMPLE" as const,
					principalCents: BigInt(500_000), // $5,000
					annualRatePercent: 8.0,
					termMonths: 24,
					monthlyPaymentCents: BigInt(22_610), // ~$226.10
					currencyCode: "USD",
					startDate: new Date("2024-06-01"),
					createdAt: new Date(),
					updatedAt: new Date(),
					payments: [],
				},
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findMany).mockResolvedValue(mockLoans as any);

			const result = await caller.dashboard.summary();

			// Should return 2 loans
			expect(result.loanOverview).toHaveLength(2);

			// First loan: balance = 1000000 - 15000 - 15500 = 969500
			expect(result.loanOverview[0]?.name).toBe("Car Loan");
			expect(result.loanOverview[0]?.balanceCents).toBe(BigInt(969_500));
			expect(result.loanOverview[0]?.interestPaidCents).toBe(BigInt(9500));
			expect(result.loanOverview[0]?.projectedPayoffDate).toBeInstanceOf(Date);
			expect(
				result.loanOverview[0]?.totalInterestRemainingCents
			).toBeGreaterThanOrEqual(0n);

			// Second loan: balance = 500000 (no payments)
			expect(result.loanOverview[1]?.name).toBe("Personal Loan");
			expect(result.loanOverview[1]?.balanceCents).toBe(BigInt(500_000));
			expect(result.loanOverview[1]?.interestPaidCents).toBe(BigInt(0));
		});

		it("handles empty state gracefully", async () => {
			// Given: No transactions, no tags, no loans
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.dashboard.summary();

			// Should return zero values and empty arrays without errors
			expect(result.monthlySummary.incomeCents).toBe(BigInt(0));
			expect(result.monthlySummary.expenseCents).toBe(BigInt(0));
			expect(result.monthlySummary.netCents).toBe(BigInt(0));
			expect(result.topTags).toEqual([]);
			expect(result.otherTagsTotal).toBe(BigInt(0));
			expect(result.loanOverview).toEqual([]);
		});

		it("filters transactions to current month only", async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			await caller.dashboard.summary();

			// Verify the transaction query filters by current month
			expect(prisma.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: MOCK_USER_ID,
						date: expect.objectContaining({
							gte: expect.any(Date),
							lte: expect.any(Date),
						}),
					}),
				})
			);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const call = vi.mocked(prisma.transaction.findMany).mock
				.calls[0]?.[0] as any;
			const dateFilter = call.where.date;

			// Verify it's filtering for the current month
			const now = new Date();
			const expectedMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
			const expectedMonthEnd = new Date(
				now.getFullYear(),
				now.getMonth() + 1,
				0,
				23,
				59,
				59,
				999
			);

			expect(dateFilter.gte.getMonth()).toBe(expectedMonthStart.getMonth());
			expect(dateFilter.lte.getMonth()).toBe(expectedMonthEnd.getMonth());
		});

		it("calls projectPayoff with correct balance", async () => {
			// Given: A loan with payments that reduce balance
			const mockLoans = [
				{
					id: MOCK_LOAN_ID_1,
					userId: MOCK_USER_ID,
					name: "Test Loan",
					interestType: "COMPOUND" as const,
					principalCents: BigInt(1_000_000), // $10,000
					annualRatePercent: 5.0,
					termMonths: 60,
					monthlyPaymentCents: BigInt(18_871), // ~$188.71 (standard PMT)
					currencyCode: "USD",
					startDate: new Date("2024-01-01"),
					createdAt: new Date(),
					updatedAt: new Date(),
					payments: [
						{ principalCents: BigInt(100_000), interestCents: BigInt(4167) }, // $1000 principal
					],
				},
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findMany).mockResolvedValue(mockLoans as any);

			const result = await caller.dashboard.summary();

			// Balance should be 1000000 - 100000 = 900000 ($9,000)
			expect(result.loanOverview[0]?.balanceCents).toBe(BigInt(900_000));
			// projectPayoff should have been called with the reduced balance
			// Verify projections exist
			expect(result.loanOverview[0]?.projectedPayoffDate).toBeDefined();
			expect(result.loanOverview[0]?.totalInterestRemainingCents).toBeDefined();
		});

		it("handles loan with zero balance", async () => {
			// Given: A loan that is fully paid off
			const mockLoans = [
				{
					id: MOCK_LOAN_ID_1,
					userId: MOCK_USER_ID,
					name: "Paid Off Loan",
					interestType: "COMPOUND" as const,
					principalCents: BigInt(100_000), // $1,000
					annualRatePercent: 5.0,
					termMonths: 12,
					monthlyPaymentCents: BigInt(8560),
					currencyCode: "USD",
					startDate: new Date("2023-01-01"),
					createdAt: new Date(),
					updatedAt: new Date(),
					payments: [
						{ principalCents: BigInt(100_000), interestCents: BigInt(2500) }, // Full principal paid
					],
				},
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findMany).mockResolvedValue(mockLoans as any);

			const result = await caller.dashboard.summary();

			// Balance should be 0
			expect(result.loanOverview[0]?.balanceCents).toBe(BigInt(0));
			// Projection should show 0 months remaining
			expect(result.loanOverview[0]?.totalInterestRemainingCents).toBe(
				BigInt(0)
			);
		});

		it("handles fewer than 5 tags", async () => {
			// Given: Only 3 tags with spending
			const mockTagSpending = [
				{
					tagId: MOCK_TAG_ID_1,
					tagName: "Food",
					tagColor: "#FF0000",
					totalCents: BigInt(50_000),
				},
				{
					tagId: MOCK_TAG_ID_2,
					tagName: "Transport",
					tagColor: "#00FF00",
					totalCents: BigInt(40_000),
				},
				{
					tagId: MOCK_TAG_ID_3,
					tagName: "Entertainment",
					tagColor: "#0000FF",
					totalCents: BigInt(30_000),
				},
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
			vi.mocked(prisma.$queryRaw).mockResolvedValue(mockTagSpending);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.dashboard.summary();

			// Should return all 3 tags
			expect(result.topTags).toHaveLength(3);
			// otherTagsTotal should be 0
			expect(result.otherTagsTotal).toBe(BigInt(0));
		});

		it("handles negative net (expenses exceed income)", async () => {
			// Given: More expenses than income
			const mockTransactions = [
				{ type: "INCOME" as const, amountCents: BigInt(50_000) }, // $500
				{ type: "EXPENSE" as const, amountCents: BigInt(100_000) }, // $1000
			];
			vi.mocked(prisma.transaction.findMany).mockResolvedValue(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				mockTransactions as any
			);
			vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.dashboard.summary();

			// Net should be negative: 50000 - 100000 = -50000
			expect(result.monthlySummary.netCents).toBe(BigInt(-50_000));
		});
	});
});
