import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		// `tsconfig` is load-bearing, not decorative. Left unset, vitest's
		// typechecker auto-discovers tsconfig.json — which excludes
		// **/*.test-d.ts so `yarn typecheck` stays scoped to shipped source — and
		// then reports a green run having checked nothing at all.
		typecheck: {
			enabled: true,
			include: ["src/**/*.test-d.ts"],
			tsconfig: "./tsconfig.typecheck.json",
		},
	},
});
