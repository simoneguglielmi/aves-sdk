import type { FlatAliasHost } from "./types.js";

const DOMAINS = ["master", "booking", "packages"] as const;

/** Bind domain prototype methods onto the facade as flat compat aliases. */
export function attachFlatAliases(client: FlatAliasHost): void {
	for (const ns of DOMAINS) {
		const domain = client[ns];
		const proto = Object.getPrototypeOf(domain) as object;
		for (const key of Object.getOwnPropertyNames(proto)) {
			if (key === "constructor" || key in client) continue;
			const value: (...args: never[]) => unknown =
				Object.getOwnPropertyDescriptor(proto, key)?.value;
			if (typeof value !== "function") continue;
			Object.defineProperty(client, key, {
				configurable: true,
				enumerable: false,
				value: value.bind(domain),
			});
		}
	}
}
