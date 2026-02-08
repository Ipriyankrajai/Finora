import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
	project: process.env.TRIGGER_PROJECT_REF || "finora-dev",
	runtime: "node-22",
	maxDuration: 300,
	dirs: ["./src/trigger"],
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 30_000,
			factor: 2,
			randomize: true,
		},
	},
	build: {
		extensions: [
			prismaExtension({
				mode: "modern",
			}),
		],
	},
});
