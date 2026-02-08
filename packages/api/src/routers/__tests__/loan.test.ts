import type { Loan, LoanPayment } from "@finora2/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Type for loan with payments (as returned by findUnique with include)
type LoanWithPayments = Loan & {
	payments: Pick<LoanPayment, "principalCents">[];
};

// Mock Prisma before importing modules that use it
vi.mock("@finora2/db", () => ({
	default: {
		user: {
			findUniqueOrThrow: vi.fn(),
		},
		loan: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		loanPayment: {
			findUnique: vi.fn(),
			create: vi.fn(),
			delete: vi.fn(),
		},
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

describe("loan router", () => {
	// Use valid CUID format IDs (must start with 'c' and have 8+ chars)
	const MOCK_USER_ID = "cluser123456789012345";
	const MOCK_LOAN_ID = "clloan12345678901234x";
	const MOCK_PAYMENT_ID = "clpayment1234567890ab";
	const MOCK_PAYMENT_ID_2 = "clpayment1234567890cd";
	const MOCK_SESSION_ID = "clsession123456789012";
	const NONEXISTENT_ID = "clnotfound12345678901";

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

	const mockLoan = {
		id: MOCK_LOAN_ID,
		userId: MOCK_USER_ID,
		name: "Car Loan",
		loanType: "AUTO" as const,
		interestType: "COMPOUND" as const,
		principalCents: BigInt(1_000_000), // $10,000
		annualRatePercent: 6.0,
		termMonths: 60,
		monthlyPaymentCents: BigInt(19_333), // ~$193.33
		currencyCode: "USD",
		startDate: new Date("2024-01-01"),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Default: user lookup returns USD currency code
		(prisma as any).user.findUniqueOrThrow.mockResolvedValue({
			currencyCode: "USD",
		});
	});

	describe("list", () => {
		it("returns loans for user with calculated balances", async () => {
			const mockLoans = [
				{
					...mockLoan,
					payments: [
						{ principalCents: BigInt(10_000), interestCents: BigInt(5000) },
						{ principalCents: BigInt(15_000), interestCents: BigInt(4500) },
					],
				},
			];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findMany).mockResolvedValue(mockLoans as any);

			const result = await caller.loan.list();

			expect(result).toHaveLength(1);
			expect(result[0]?.balanceCents).toBe(
				BigInt(1_000_000) - BigInt(10_000) - BigInt(15_000)
			); // Principal - payments
			expect(result[0]?.totalInterestPaidCents).toBe(
				BigInt(5000) + BigInt(4500)
			);
			// Should not include payments array in response
			expect(result[0]).not.toHaveProperty("payments");
		});

		it("returns empty array when no loans exist", async () => {
			vi.mocked(prisma.loan.findMany).mockResolvedValue([]);

			const result = await caller.loan.list();

			expect(result).toEqual([]);
		});
	});

	describe("getById", () => {
		it("returns loan with payments and projections", async () => {
			const loanWithPayments = {
				...mockLoan,
				payments: [
					{
						id: MOCK_PAYMENT_ID,
						loanId: MOCK_LOAN_ID,
						amountCents: BigInt(20_000),
						principalCents: BigInt(15_000),
						interestCents: BigInt(5000),
						lateFeeCents: BigInt(0),
						isExtra: false,
						paidAt: new Date("2024-02-01"),
						linkedTransactionId: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(
				loanWithPayments as any
			);

			const result = await caller.loan.getById({ id: MOCK_LOAN_ID });

			expect(result.id).toBe(MOCK_LOAN_ID);
			expect(result.balanceCents).toBe(BigInt(1_000_000) - BigInt(15_000));
			expect(result.totalInterestPaidCents).toBe(BigInt(5000));
			expect(result.projection).toBeDefined();
			expect(result.projection.monthsRemaining).toBeGreaterThan(0);
			expect(result.payments).toBeDefined();
		});

		it("calculates balance from payments correctly", async () => {
			const loanWithMultiplePayments = {
				...mockLoan,
				payments: [
					{
						id: MOCK_PAYMENT_ID,
						loanId: MOCK_LOAN_ID,
						amountCents: BigInt(20_000),
						principalCents: BigInt(15_000),
						interestCents: BigInt(5000),
						lateFeeCents: BigInt(0),
						isExtra: false,
						paidAt: new Date("2024-02-01"),
						linkedTransactionId: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: MOCK_PAYMENT_ID_2,
						loanId: MOCK_LOAN_ID,
						amountCents: BigInt(20_000),
						principalCents: BigInt(15_500),
						interestCents: BigInt(4500),
						lateFeeCents: BigInt(0),
						isExtra: false,
						paidAt: new Date("2024-03-01"),
						linkedTransactionId: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(
				loanWithMultiplePayments as any
			);

			const result = await caller.loan.getById({ id: MOCK_LOAN_ID });

			// Balance = principal - sum of principal payments
			expect(result.balanceCents).toBe(
				BigInt(1_000_000) - BigInt(15_000) - BigInt(15_500)
			);
			// Total interest = sum of interest payments
			expect(result.totalInterestPaidCents).toBe(BigInt(5000) + BigInt(4500));
		});

		it("throws NOT_FOUND when loan does not exist", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(null);

			await expect(caller.loan.getById({ id: NONEXISTENT_ID })).rejects.toThrow(
				expect.objectContaining({
					code: "NOT_FOUND",
					message: "Loan not found",
				})
			);
		});

		it("throws UNAUTHORIZED for other user's loan", async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				userId: "other-user",
				payments: [],
			} as any);

			await expect(caller.loan.getById({ id: MOCK_LOAN_ID })).rejects.toThrow(
				expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "You don't have permission to view this loan",
				})
			);
		});
	});

	describe("create", () => {
		it("creates loan with valid input", async () => {
			vi.mocked(prisma.loan.create).mockResolvedValue(mockLoan);

			const result = await caller.loan.create({
				name: "Car Loan",
				loanType: "AUTO",
				interestType: "COMPOUND",
				principal: "10000.00",
				annualRatePercent: 6.0,
				termMonths: 60,
				monthlyPayment: "193.33",
				startDate: new Date("2024-01-01"),
			});

			expect(result).toEqual(mockLoan);
			expect(prisma.loan.create).toHaveBeenCalledWith({
				data: {
					userId: MOCK_USER_ID,
					name: "Car Loan",
					loanType: "AUTO",
					interestType: "COMPOUND",
					principalCents: BigInt(1_000_000),
					annualRatePercent: 6.0,
					termMonths: 60,
					monthlyPaymentCents: BigInt(19_333),
					startDate: new Date("2024-01-01"),
					currencyCode: "USD",
				},
			});
		});

		it("converts amount strings to cents", async () => {
			vi.mocked(prisma.loan.create).mockResolvedValue(mockLoan);

			await caller.loan.create({
				name: "Home Loan",
				loanType: "MORTGAGE",
				principal: "250000.50",
				annualRatePercent: 4.5,
				termMonths: 360,
				monthlyPayment: "1266.71",
				startDate: new Date("2024-01-01"),
			});

			expect(prisma.loan.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					principalCents: BigInt(25_000_050), // $250,000.50 -> 25000050 cents
					monthlyPaymentCents: BigInt(126_671), // $1,266.71 -> 126671 cents
				}),
			});
		});

		it("rejects negative principal", async () => {
			await expect(
				caller.loan.create({
					name: "Bad Loan",
					loanType: "PERSONAL",
					principal: "-1000.00",
					annualRatePercent: 5,
					termMonths: 12,
					monthlyPayment: "100.00",
					startDate: new Date(),
				})
			).rejects.toThrow();
		});

		it("rejects rate > 100%", async () => {
			await expect(
				caller.loan.create({
					name: "Bad Loan",
					loanType: "PERSONAL",
					principal: "1000.00",
					annualRatePercent: 150,
					termMonths: 12,
					monthlyPayment: "100.00",
					startDate: new Date(),
				})
			).rejects.toThrow();
		});
	});

	describe("update", () => {
		it("updates loan with valid input", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan);
			vi.mocked(prisma.loan.update).mockResolvedValue({
				...mockLoan,
				name: "Updated Car Loan",
			});

			const result = await caller.loan.update({
				id: MOCK_LOAN_ID,
				name: "Updated Car Loan",
			});

			expect(result.name).toBe("Updated Car Loan");
			expect(prisma.loan.update).toHaveBeenCalledWith({
				where: { id: MOCK_LOAN_ID },
				data: { name: "Updated Car Loan" },
			});
		});

		it("throws UNAUTHORIZED for other user's loan", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				userId: "other-user",
			});

			await expect(
				caller.loan.update({ id: MOCK_LOAN_ID, name: "Hacked Loan" })
			).rejects.toThrow(
				expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "You don't have permission to update this loan",
				})
			);
		});
	});

	describe("delete", () => {
		it("deletes loan", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(mockLoan);
			vi.mocked(prisma.loan.delete).mockResolvedValue(mockLoan);

			const result = await caller.loan.delete({ id: MOCK_LOAN_ID });

			expect(result.success).toBe(true);
			expect(prisma.loan.delete).toHaveBeenCalledWith({
				where: { id: MOCK_LOAN_ID },
			});
		});

		it("throws UNAUTHORIZED for other user's loan", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				userId: "other-user",
			});

			await expect(caller.loan.delete({ id: MOCK_LOAN_ID })).rejects.toThrow(
				expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "You don't have permission to delete this loan",
				})
			);
		});
	});

	describe("addPayment", () => {
		it("adds regular payment with correct principal/interest split", async () => {
			const loanWithPayments = {
				...mockLoan,
				payments: [], // No previous payments, full balance
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(
				loanWithPayments as any
			);

			const createdPayment = {
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(100_000), // $1000
				principalCents: BigInt(95_000), // ~$950
				interestCents: BigInt(5000), // ~$50
				lateFeeCents: BigInt(0),
				isExtra: false,
				paidAt: new Date("2024-02-01"),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			vi.mocked(prisma.loanPayment.create).mockResolvedValue(createdPayment);

			const result = await caller.loan.addPayment({
				loanId: MOCK_LOAN_ID,
				amount: "1000.00",
				paidAt: new Date("2024-02-01"),
				isExtra: false,
			});

			expect(result.loanId).toBe(MOCK_LOAN_ID);
			// Verify the payment was created with a split
			expect(prisma.loanPayment.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					loanId: MOCK_LOAN_ID,
					amountCents: BigInt(100_000),
					isExtra: false,
				}),
			});
		});

		it("marks extra payments with isExtra = true", async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				payments: [],
			} as any);
			vi.mocked(prisma.loanPayment.create).mockResolvedValue({
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(50_000),
				principalCents: BigInt(47_500),
				interestCents: BigInt(2500),
				lateFeeCents: BigInt(0),
				isExtra: true,
				paidAt: new Date("2024-02-15"),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const result = await caller.loan.addPayment({
				loanId: MOCK_LOAN_ID,
				amount: "500.00",
				paidAt: new Date("2024-02-15"),
				isExtra: true,
			});

			expect(result.isExtra).toBe(true);
			expect(prisma.loanPayment.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					isExtra: true,
				}),
			});
		});

		it("throws when loan does not exist", async () => {
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(null);

			await expect(
				caller.loan.addPayment({
					loanId: NONEXISTENT_ID,
					amount: "100.00",
					paidAt: new Date(),
				})
			).rejects.toThrow(
				expect.objectContaining({
					code: "NOT_FOUND",
					message: "Loan not found",
				})
			);
		});

		it("throws when loan belongs to other user", async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				userId: "other-user",
				payments: [],
			} as any);

			await expect(
				caller.loan.addPayment({
					loanId: MOCK_LOAN_ID,
					amount: "100.00",
					paidAt: new Date(),
				})
			).rejects.toThrow(
				expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "You don't have permission to add payments to this loan",
				})
			);
		});

		it("throws BAD_REQUEST when payment exceeds remaining balance", async () => {
			// Loan has $100 remaining balance ($10000 principal - $9900 in payments)
			// Payoff amount = $100 + current month interest ($100 * 6%/12 = $0.50) = $100.50
			const loanWithPartialPayment: LoanWithPayments = {
				...mockLoan,
				principalCents: BigInt(1_000_000), // $10,000
				payments: [
					{ principalCents: BigInt(990_000) }, // $9,900 already paid
				],
			};
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(
				loanWithPartialPayment
			);

			// Try to pay $200 when payoff is only $100.50
			await expect(
				caller.loan.addPayment({
					loanId: MOCK_LOAN_ID,
					amount: "200.00",
					paidAt: new Date(),
					isExtra: false,
				})
			).rejects.toThrow(
				expect.objectContaining({
					code: "BAD_REQUEST",
					message:
						"Payment amount exceeds payoff amount. Maximum payment allowed is $100.50",
				})
			);
		});

		it("throws BAD_REQUEST when loan is already paid off", async () => {
			// Loan is fully paid off (balance = 0)
			const fullyPaidLoan: LoanWithPayments = {
				...mockLoan,
				principalCents: BigInt(1_000_000), // $10,000
				payments: [
					{ principalCents: BigInt(1_000_000) }, // Fully paid
				],
			};
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(fullyPaidLoan);

			await expect(
				caller.loan.addPayment({
					loanId: MOCK_LOAN_ID,
					amount: "100.00",
					paidAt: new Date(),
					isExtra: false,
				})
			).rejects.toThrow(
				expect.objectContaining({
					code: "BAD_REQUEST",
					message: "This loan has already been paid off",
				})
			);
		});

		it("allows payment equal to remaining balance", async () => {
			// Loan has exactly $100 remaining
			const loanWithSmallBalance: LoanWithPayments = {
				...mockLoan,
				principalCents: BigInt(1_000_000), // $10,000
				annualRatePercent: 6.0,
				payments: [
					{ principalCents: BigInt(990_000) }, // $9,900 already paid, $100 remains
				],
			};
			vi.mocked(prisma.loan.findUnique).mockResolvedValue(loanWithSmallBalance);

			vi.mocked(prisma.loanPayment.create).mockResolvedValue({
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(10_000),
				principalCents: BigInt(9950), // After interest deduction
				interestCents: BigInt(50),
				lateFeeCents: BigInt(0),
				isExtra: false,
				paidAt: new Date(),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Pay exactly $100 when $100 remains - should succeed
			const result = await caller.loan.addPayment({
				loanId: MOCK_LOAN_ID,
				amount: "100.00",
				paidAt: new Date(),
				isExtra: false,
			});

			expect(result.loanId).toBe(MOCK_LOAN_ID);
		});

		it("calculates correct split for payment on $10000 balance at 6% rate", async () => {
			// Given: $10,000 balance, 6% annual rate
			// Monthly rate = 6% / 12 = 0.5%
			// Interest for 1 month = $10,000 * 0.005 = $50
			// Payment of $1000 should split as ~$50 interest, ~$950 principal
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loan.findUnique).mockResolvedValue({
				...mockLoan,
				principalCents: BigInt(1_000_000), // $10,000
				annualRatePercent: 6.0,
				payments: [], // No payments yet
			} as any);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let capturedData: any = null;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(prisma.loanPayment.create as any).mockImplementation(
				({ data }: { data: Record<string, unknown> }) => {
					capturedData = data;
					return {
						id: MOCK_PAYMENT_ID,
						loanId: data.loanId,
						amountCents: data.amountCents,
						principalCents: data.principalCents,
						interestCents: data.interestCents,
						lateFeeCents: BigInt(0),
						isExtra: data.isExtra,
						paidAt: data.paidAt,
						linkedTransactionId: null,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}
			);

			await caller.loan.addPayment({
				loanId: MOCK_LOAN_ID,
				amount: "1000.00", // $1000 payment
				paidAt: new Date("2024-02-01"),
				isExtra: false,
			});

			// $10,000 * (6% / 12) = $50 interest
			// $1000 - $50 = $950 principal
			expect(capturedData).not.toBeNull();
			expect(capturedData?.interestCents).toBe(BigInt(5000)); // $50.00
			expect(capturedData?.principalCents).toBe(BigInt(95_000)); // $950.00
		});
	});

	describe("deletePayment", () => {
		it("deletes payment", async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loanPayment.findUnique).mockResolvedValue({
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(20_000),
				principalCents: BigInt(15_000),
				interestCents: BigInt(5000),
				lateFeeCents: BigInt(0),
				isExtra: false,
				paidAt: new Date(),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				loan: { userId: MOCK_USER_ID },
			} as any);
			vi.mocked(prisma.loanPayment.delete).mockResolvedValue({
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(20_000),
				principalCents: BigInt(15_000),
				interestCents: BigInt(5000),
				lateFeeCents: BigInt(0),
				isExtra: false,
				paidAt: new Date(),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const result = await caller.loan.deletePayment({ id: MOCK_PAYMENT_ID });

			expect(result.success).toBe(true);
			expect(prisma.loanPayment.delete).toHaveBeenCalledWith({
				where: { id: MOCK_PAYMENT_ID },
			});
		});

		it("throws when payment does not exist", async () => {
			vi.mocked(prisma.loanPayment.findUnique).mockResolvedValue(null);

			await expect(
				caller.loan.deletePayment({ id: NONEXISTENT_ID })
			).rejects.toThrow(
				expect.objectContaining({
					code: "NOT_FOUND",
					message: "Payment not found",
				})
			);
		});

		it("throws when payment belongs to other user's loan", async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vi.mocked(prisma.loanPayment.findUnique).mockResolvedValue({
				id: MOCK_PAYMENT_ID,
				loanId: MOCK_LOAN_ID,
				amountCents: BigInt(20_000),
				principalCents: BigInt(15_000),
				interestCents: BigInt(5000),
				lateFeeCents: BigInt(0),
				isExtra: false,
				paidAt: new Date(),
				linkedTransactionId: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				loan: { userId: "other-user" },
			} as any);

			await expect(
				caller.loan.deletePayment({ id: MOCK_PAYMENT_ID })
			).rejects.toThrow(
				expect.objectContaining({
					code: "UNAUTHORIZED",
					message: "You don't have permission to delete this payment",
				})
			);
		});
	});
});
