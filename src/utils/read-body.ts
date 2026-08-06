/** Decode a stream chunk to UTF-8 text. */
function chunkToString(chunk: unknown): string {
	if (typeof chunk === "string") return chunk;
	if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk))
		return Buffer.from(chunk).toString("utf8");
	return String(chunk);
}

/**
 * Read a body as UTF-8 keeping at most `maxChars`.
 * Continues draining the stream after the cap so the socket can be reused.
 */
export async function readTextCapped(
	body: AsyncIterable<unknown>,
	maxChars: number,
): Promise<string> {
	let out = "";
	for await (const chunk of body) {
		if (out.length >= maxChars) continue;
		const piece = chunkToString(chunk);
		const room = maxChars - out.length;
		out += piece.length <= room ? piece : piece.slice(0, room);
	}
	return out;
}
