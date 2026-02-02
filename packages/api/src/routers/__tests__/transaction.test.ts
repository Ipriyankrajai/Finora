import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock @finora2/db module
vi.mock("@finora2/db", () => ({
	default: {
		transaction: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		tag: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		transactionTag: {
			createMany: vi.fn(),
			deleteMany: vi.fn(),
		},
		loan: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		loanPayment: {
			findMany: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

import db from "@finora2/db";
import { TRPCError } from "@trpc/server";

import { appRouter } from "../index";

// Type-safe mock helpers
const mockDb = db as unknown as {
	transaction: {
		findMany: Mock;
		findUnique: Mock;
		create: Mock;
		update: Mock;
		delete: Mock;
	};
	transactionTag: {
		createMany: Mock;
		deleteMany: Mock;
	};
	$transaction: Mock;
};

// Test user
const mockUser = {
	id: "cluser123456789012345678",
	name: "Test User",
	email: "test@example.com",
	emailVerified: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	image: null,
};

// Create a caller with mock session
const createCaller = () => {
	return appRouter.createCaller({
		session: {
			user: mockUser,
			session: {
				id: "clsession123456789012345",
				userId: mockUser.id,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				token: "test-token",
				createdAt: new Date(),
				updatedAt: new Date(),
				ipAddress: null,
				userAgent: null,
			},
		},
	});
};

// Sample transaction data
const createMockTransaction = (overrides = {}) => ({
	id: "cltx123456789012345678901",
	userId: mockUser.id,
	type: "EXPENSE" as const,
	amountCents: 5000n,
	date: new Date("2024-01-15"),
	description: "Groceries",
	currencyCode: "USD",
	createdAt: new Date(),
	updatedAt: new Date(),
	tags: [],
	...overrides,
});

describe("transactionRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("list", () => {
		it("returns paginated transactions for user", async () => {
			const mockTransactions = [
				createMockTransaction({ id: "cltx1" }),
				createMockTransaction({ id: "cltx2" }),
			];

			mockDb.transaction.findMany.mockResolvedValue(mockTransactions);

			const caller = createCaller();
			const result = await caller.transaction.list({});

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: mockUser.id },
					take: 21, // limit + 1
					orderBy: { date: "desc" },
				})
			);
			expect(result.items).toEqual(mockTransactions);
			expect(result.nextCursor).toBeUndefined();
		});

		it("returns hasMore=true when more items exist", async () => {
			// Return 21 items (limit + 1)
			const mockTransactions = Array.from({ length: 21 }, (_, i) =>
				createMockTransaction({ id: `cltx${i.toString().padStart(24, "0")}` })
			);

			mockDb.transaction.findMany.mockResolvedValue(mockTransactions);

			const caller = createCaller();
			const result = await caller.transaction.list({ limit: 20 });

			expect(result.items).toHaveLength(20);
			expect(result.nextCursor).toBeDefined();
		});

		it("filters by date range", async () => {
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			const dateFrom = new Date("2024-01-01");
			const dateTo = new Date("2024-01-31");

			await caller.transaction.list({ dateFrom, dateTo });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: mockUser.id,
						date: {
							gte: dateFrom,
							lte: dateTo,
						},
					}),
				})
			);
		});

		it("filters by type (EXPENSE)", async () => {
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({ type: "EXPENSE" });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: mockUser.id,
						type: "EXPENSE",
					}),
				})
			);
		});

		it("filters by type (INCOME)", async () => {
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({ type: "INCOME" });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: mockUser.id,
						type: "INCOME",
					}),
				})
			);
		});

		it("filters by tag", async () => {
			const tagId = "cltag12345678901234567890";
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({ tagId });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: mockUser.id,
						tags: { some: { tagId } },
					}),
				})
			);
		});

		it("filters by amount range", async () => {
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({
				amountMin: "1000",
				amountMax: "5000",
			});

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						userId: mockUser.id,
						amountCents: {
							gte: BigInt(1000),
							lte: BigInt(5000),
						},
					}),
				})
			);
		});

		it("supports cursor pagination", async () => {
			const cursor = "cltx123456789012345678901";
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({ cursor });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					cursor: { id: cursor },
					skip: 1,
				})
			);
		});

		it("filters by date preset last30days", async () => {
			mockDb.transaction.findMany.mockResolvedValue([]);

			const caller = createCaller();
			await caller.transaction.list({ datePreset: "last30days" });

			expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						date: expect.objectContaining({
							gte: expect.any(Date),
							lte: expect.any(Date),
						}),
					}),
				})
			);
		});
	});

	describe("getById", () => {
		it("returns transaction for owner", async () => {
			const mockTransaction = createMockTransaction();
			mockDb.transaction.findUnique.mockResolvedValue(mockTransaction);

			const caller = createCaller();
			const result = await caller.transaction.getById({
				id: mockTransaction.id,
			});

			expect(result).toEqual(mockTransaction);
		});

		it("throws NOT_FOUND for non-existent transaction", async () => {
			mockDb.transaction.findUnique.mockResolvedValue(null);

			const caller = createCaller();
			await expect(
				caller.transaction.getById({ id: "cltx000000000000000000000" })
			).rejects.toThrow(TRPCError);
		});

		it("throws UNAUTHORIZED for other user's transaction", async () => {
			const mockTransaction = createMockTransaction({
				userId: "clother12345678901234567",
			});
			mockDb.transaction.findUnique.mockResolvedValue(mockTransaction);

			const caller = createCaller();
			await expect(
				caller.transaction.getById({ id: mockTransaction.id })
			).rejects.toThrow(TRPCError);
		});
	});

	describe("create", () => {
		it("creates expense with valid input", async () => {
			const mockTransaction = createMockTransaction();

			// Mock $transaction to execute the callback
			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							create: vi.fn().mockResolvedValue(mockTransaction),
							findUnique: vi.fn().mockResolvedValue(mockTransaction),
						},
						transactionTag: {
							createMany: vi.fn().mockResolvedValue({ count: 0 }),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			const result = await caller.transaction.create({
				type: "EXPENSE",
				amount: "50.00",
				date: new Date("2024-01-15"),
				description: "Groceries",
			});

			expect(result).toEqual(mockTransaction);
		});

		it("creates income with valid input", async () => {
			const mockTransaction = createMockTransaction({ type: "INCOME" });

			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							create: vi.fn().mockResolvedValue(mockTransaction),
							findUnique: vi.fn().mockResolvedValue(mockTransaction),
						},
						transactionTag: {
							createMany: vi.fn().mockResolvedValue({ count: 0 }),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			const result = await caller.transaction.create({
				type: "INCOME",
				amount: "100.00",
				date: new Date("2024-01-15"),
				description: "Salary",
			});

			expect(result?.type).toBe("INCOME");
		});

		it("creates with multiple tags", async () => {
			const tagIds = ["cltag12345678901234567890", "cltag23456789012345678901"];
			const mockTransaction = createMockTransaction({
				tags: tagIds.map((tagId) => ({
					tagId,
					tag: { id: tagId, name: "Test" },
				})),
			});

			let createManyCalledWith: unknown;
			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							create: vi.fn().mockResolvedValue(mockTransaction),
							findUnique: vi.fn().mockResolvedValue(mockTransaction),
						},
						transactionTag: {
							createMany: vi.fn().mockImplementation((args: unknown) => {
								createManyCalledWith = args;
								return { count: tagIds.length };
							}),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			await caller.transaction.create({
				type: "EXPENSE",
				amount: "50.00",
				date: new Date("2024-01-15"),
				tagIds,
			});

			expect(createManyCalledWith).toEqual({
				data: tagIds.map((tagId) => ({
					transactionId: mockTransaction.id,
					tagId,
				})),
			});
		});

		it("converts amount string to cents correctly", async () => {
			const mockTransaction = createMockTransaction({ amountCents: 12345n });

			let createCalledWith: unknown;
			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							create: vi.fn().mockImplementation((args: unknown) => {
								createCalledWith = args;
								return mockTransaction;
							}),
							findUnique: vi.fn().mockResolvedValue(mockTransaction),
						},
						transactionTag: {
							createMany: vi.fn().mockResolvedValue({ count: 0 }),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			await caller.transaction.create({
				type: "EXPENSE",
				amount: "123.45",
				date: new Date("2024-01-15"),
			});

			expect(
				(createCalledWith as { data: { amountCents: bigint } }).data.amountCents
			).toBe(12345n);
		});

		it("rejects negative amount", async () => {
			const caller = createCaller();
			await expect(
				caller.transaction.create({
					type: "EXPENSE",
					amount: "-50.00",
					date: new Date("2024-01-15"),
				})
			).rejects.toThrow();
		});

		it("rejects amount over max", async () => {
			const caller = createCaller();
			await expect(
				caller.transaction.create({
					type: "EXPENSE",
					amount: "9999999999.99",
					date: new Date("2024-01-15"),
				})
			).rejects.toThrow();
		});
	});

	describe("update", () => {
		it("updates transaction with valid input", async () => {
			const existingTransaction = createMockTransaction();
			const updatedTransaction = {
				...existingTransaction,
				description: "Updated",
			};

			mockDb.transaction.findUnique.mockResolvedValue(existingTransaction);
			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							update: vi.fn().mockResolvedValue(updatedTransaction),
							findUnique: vi.fn().mockResolvedValue(updatedTransaction),
						},
						transactionTag: {
							deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
							createMany: vi.fn().mockResolvedValue({ count: 0 }),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			const result = await caller.transaction.update({
				id: existingTransaction.id,
				description: "Updated",
			});

			expect(result?.description).toBe("Updated");
		});

		it("replaces tags when tagIds provided", async () => {
			const existingTransaction = createMockTransaction();
			const newTagIds = ["cltag12345678901234567890"];

			mockDb.transaction.findUnique.mockResolvedValue(existingTransaction);

			let deleteCalledWith: unknown;
			let createCalledWith: unknown;
			mockDb.$transaction.mockImplementation(
				async (callback: (tx: unknown) => Promise<unknown>) => {
					const tx = {
						transaction: {
							update: vi.fn().mockResolvedValue(existingTransaction),
							findUnique: vi.fn().mockResolvedValue({
								...existingTransaction,
								tags: newTagIds.map((id) => ({ tagId: id })),
							}),
						},
						transactionTag: {
							deleteMany: vi.fn().mockImplementation((args: unknown) => {
								deleteCalledWith = args;
								return { count: 0 };
							}),
							createMany: vi.fn().mockImplementation((args: unknown) => {
								createCalledWith = args;
								return { count: newTagIds.length };
							}),
						},
					};
					return await callback(tx);
				}
			);

			const caller = createCaller();
			await caller.transaction.update({
				id: existingTransaction.id,
				tagIds: newTagIds,
			});

			expect(deleteCalledWith).toEqual({
				where: { transactionId: existingTransaction.id },
			});
			expect(createCalledWith).toEqual({
				data: newTagIds.map((tagId) => ({
					transactionId: existingTransaction.id,
					tagId,
				})),
			});
		});

		it("throws UNAUTHORIZED for other user's transaction", async () => {
			const existingTransaction = createMockTransaction({
				userId: "clother12345678901234567",
			});

			mockDb.transaction.findUnique.mockResolvedValue(existingTransaction);

			const caller = createCaller();
			await expect(
				caller.transaction.update({
					id: existingTransaction.id,
					description: "Updated",
				})
			).rejects.toThrow(TRPCError);
		});

		it("throws NOT_FOUND for non-existent transaction", async () => {
			mockDb.transaction.findUnique.mockResolvedValue(null);

			const caller = createCaller();
			await expect(
				caller.transaction.update({
					id: "cltx000000000000000000000",
					description: "Updated",
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe("delete", () => {
		it("deletes transaction", async () => {
			const existingTransaction = createMockTransaction();

			mockDb.transaction.findUnique.mockResolvedValue(existingTransaction);
			mockDb.transaction.delete.mockResolvedValue(existingTransaction);

			const caller = createCaller();
			const result = await caller.transaction.delete({
				id: existingTransaction.id,
			});

			expect(result).toEqual({ success: true });
			expect(mockDb.transaction.delete).toHaveBeenCalledWith({
				where: { id: existingTransaction.id },
			});
		});

		it("throws UNAUTHORIZED for other user's transaction", async () => {
			const existingTransaction = createMockTransaction({
				userId: "clother12345678901234567",
			});

			mockDb.transaction.findUnique.mockResolvedValue(existingTransaction);

			const caller = createCaller();
			await expect(
				caller.transaction.delete({ id: existingTransaction.id })
			).rejects.toThrow(TRPCError);
		});

		it("throws NOT_FOUND for non-existent transaction", async () => {
			mockDb.transaction.findUnique.mockResolvedValue(null);

			const caller = createCaller();
			await expect(
				caller.transaction.delete({ id: "cltx000000000000000000000" })
			).rejects.toThrow(TRPCError);
		});
	});
});
