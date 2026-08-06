import { describe, expect, it } from "vitest";
import { readTextCapped } from "./read-body.js";

async function* chunks(...parts: (string | Uint8Array)[]) {
	for (const part of parts) yield part;
}

describe("readTextCapped", () => {
	it("keeps at most maxChars while draining the rest", async () => {
		const text = await readTextCapped(chunks("aaaa", "bbbb", "cccc"), 6);
		expect(text).toBe("aaaabb");
	});

	it("decodes Uint8Array chunks as utf8", async () => {
		const text = await readTextCapped(
			chunks(new TextEncoder().encode("hello-world")),
			5,
		);
		expect(text).toBe("hello");
	});
});
