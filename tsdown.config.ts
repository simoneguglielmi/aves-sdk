import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	dts: true,
	format: ["esm"],
	// Published clients do not need maps; they bloat the npm tarball (~170KB).
	sourcemap: false,
	clean: true,
	minify: true,
	treeshake: true,
	target: false,
	deps: {
		neverBundle: [
			"valibot",
			"undici",
			"fast-xml-parser",
			"fast-xml-builder",
		],
	},
});
