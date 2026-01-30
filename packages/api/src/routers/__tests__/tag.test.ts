import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock db module with inline mock object (vi.mock is hoisted)
vi.mock("@finora2/db", () => ({
  default: {
    tag: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
  InterestType: {
    FIXED: "FIXED",
    VARIABLE: "VARIABLE",
  },
}));

import prisma from "@finora2/db";
import { createCallerFactory } from "../../index";
import { appRouter } from "../index";

const createCaller = createCallerFactory(appRouter);

// Valid CUID format IDs for testing
const TEST_USER_ID = "cuid1234567890abcdef";
const TEST_TAG_ID_1 = "cuid1234567890tag001";
const TEST_TAG_ID_2 = "cuid1234567890tag002";
const OTHER_USER_ID = "cuid1234567890other1";

describe("tag router", () => {
  const mockUser = { id: TEST_USER_ID, email: "test@test.com", name: "Test User" };
  const mockSession = {
    user: mockUser,
    session: {
      id: "cuid1234567890sess01",
      userId: mockUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      token: "test-token",
      ipAddress: null,
      userAgent: null,
    },
  };

  // Create caller with mock session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caller = createCaller({ session: mockSession } as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns only active tags for the authenticated user", async () => {
      const mockTags = [
        {
          id: TEST_TAG_ID_1,
          userId: TEST_USER_ID,
          name: "Food",
          color: "#FF0000",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: TEST_TAG_ID_2,
          userId: TEST_USER_ID,
          name: "Transport",
          color: "#00FF00",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(prisma.tag.findMany).mockResolvedValue(mockTags);

      const result = await caller.tag.list();

      expect(result).toEqual(mockTags);
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
          isActive: true,
        },
        orderBy: { name: "asc" },
      });
    });

    it("returns empty array when no tags exist", async () => {
      vi.mocked(prisma.tag.findMany).mockResolvedValue([]);

      const result = await caller.tag.list();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates a tag with valid input", async () => {
      const newTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Travel",
        color: "#00FF00",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.tag.create).mockResolvedValue(newTag);

      const result = await caller.tag.create({
        name: "Travel",
        color: "#00FF00",
      });

      expect(result).toEqual(newTag);
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_ID,
          name: "Travel",
          color: "#00FF00",
        },
      });
    });

    it("trims whitespace from name", async () => {
      const newTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Travel",
        color: "#00FF00",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.tag.create).mockResolvedValue(newTag);

      await caller.tag.create({
        name: "  Travel  ",
        color: "#00FF00",
      });

      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          userId: TEST_USER_ID,
          name: "Travel",
          color: "#00FF00",
        },
      });
    });

    it("rejects invalid color format", async () => {
      await expect(
        caller.tag.create({ name: "Test", color: "invalid" })
      ).rejects.toThrow();
    });

    it("rejects color without hash prefix", async () => {
      await expect(
        caller.tag.create({ name: "Test", color: "FF0000" })
      ).rejects.toThrow();
    });

    it("rejects empty name", async () => {
      await expect(
        caller.tag.create({ name: "", color: "#FF0000" })
      ).rejects.toThrow();
    });

    it("rejects name that is only whitespace", async () => {
      await expect(
        caller.tag.create({ name: "   ", color: "#FF0000" })
      ).rejects.toThrow();
    });

    it("rejects name exceeding 50 characters", async () => {
      const longName = "a".repeat(51);
      await expect(
        caller.tag.create({ name: longName, color: "#FF0000" })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("updates tag with valid input", async () => {
      const existingTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Food",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedTag = {
        ...existingTag,
        name: "Groceries",
        color: "#00FF00",
      };
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(existingTag);
      vi.mocked(prisma.tag.update).mockResolvedValue(updatedTag);

      const result = await caller.tag.update({
        id: TEST_TAG_ID_1,
        name: "Groceries",
        color: "#00FF00",
      });

      expect(result).toEqual(updatedTag);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: TEST_TAG_ID_1 },
        data: {
          name: "Groceries",
          color: "#00FF00",
        },
      });
    });

    it("allows partial update (name only)", async () => {
      const existingTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Food",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedTag = { ...existingTag, name: "Groceries" };
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(existingTag);
      vi.mocked(prisma.tag.update).mockResolvedValue(updatedTag);

      await caller.tag.update({
        id: TEST_TAG_ID_1,
        name: "Groceries",
      });

      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: TEST_TAG_ID_1 },
        data: {
          name: "Groceries",
        },
      });
    });

    it("allows partial update (color only)", async () => {
      const existingTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Food",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedTag = { ...existingTag, color: "#00FF00" };
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(existingTag);
      vi.mocked(prisma.tag.update).mockResolvedValue(updatedTag);

      await caller.tag.update({
        id: TEST_TAG_ID_1,
        color: "#00FF00",
      });

      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: TEST_TAG_ID_1 },
        data: {
          color: "#00FF00",
        },
      });
    });

    it("throws NOT_FOUND when tag does not exist", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(null);

      await expect(
        caller.tag.update({ id: TEST_TAG_ID_1, name: "New Name" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "Tag not found",
        })
      );
    });

    it("throws UNAUTHORIZED when accessing another user's tag", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue({
        id: TEST_TAG_ID_1,
        userId: OTHER_USER_ID,
        name: "Secret",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        caller.tag.update({ id: TEST_TAG_ID_1, name: "New Name" })
      ).rejects.toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "You do not have access to this tag",
        })
      );
    });
  });

  describe("delete", () => {
    it("soft deletes by setting isActive to false", async () => {
      const existingTag = {
        id: TEST_TAG_ID_1,
        userId: TEST_USER_ID,
        name: "Food",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const deletedTag = { ...existingTag, isActive: false };
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(existingTag);
      vi.mocked(prisma.tag.update).mockResolvedValue(deletedTag);

      const result = await caller.tag.delete({ id: TEST_TAG_ID_1 });

      expect(result.isActive).toBe(false);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: TEST_TAG_ID_1 },
        data: { isActive: false },
      });
    });

    it("throws NOT_FOUND when tag does not exist", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue(null);

      await expect(caller.tag.delete({ id: TEST_TAG_ID_1 })).rejects.toThrow(
        expect.objectContaining({
          code: "NOT_FOUND",
          message: "Tag not found",
        })
      );
    });

    it("throws UNAUTHORIZED when accessing another user's tag", async () => {
      vi.mocked(prisma.tag.findUnique).mockResolvedValue({
        id: TEST_TAG_ID_1,
        userId: OTHER_USER_ID,
        name: "Secret",
        color: "#FF0000",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(caller.tag.delete({ id: TEST_TAG_ID_1 })).rejects.toThrow(
        expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "You do not have access to this tag",
        })
      );
    });
  });
});
