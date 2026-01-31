import { vi } from "vitest";

// Set environment variables before any modules are loaded
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-chars-long";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.NODE_ENV = "test";

// Mock @finora2/auth module
vi.mock("@finora2/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));
