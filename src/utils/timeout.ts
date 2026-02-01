export interface TimeoutController {
	signal: AbortSignal;
	clear?: () => void;
}

/**
 * Create an AbortSignal that will automatically abort after `timeoutMs`.
 * If `timeoutMs` is not provided or <= 0, no automatic abort is scheduled.
 */
export function createTimeoutSignal(timeoutMs?: number): TimeoutController {
	const controller = new AbortController();

	if (!timeoutMs || timeoutMs <= 0) {
		return { signal: controller.signal };
	}

	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	return {
		signal: controller.signal,
		clear: () => clearTimeout(timeoutId),
	};
}
