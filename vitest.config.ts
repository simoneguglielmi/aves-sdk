import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Local e2e credentials (src/test, gitignored) come from .env; Node reads it natively.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		// `tsconfig` is load-bearing, not decorative. Left unset, vitest's
		// typechecker auto-discovers tsconfig.json — which excludes
		// **/*.test-d.ts so `pnpm typecheck` stays scoped to shipped source — and
		// then reports a green run having checked nothing at all.
		typecheck: {
			enabled: true,
			include: ["src/**/*.test-d.ts"],
			tsconfig: "./tsconfig.typecheck.json",
		},
	},
});
