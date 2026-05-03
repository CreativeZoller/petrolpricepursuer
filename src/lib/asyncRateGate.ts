import { delay } from "./delay";

/**
 * Ensures a minimum wall-clock gap between consecutive `enter` calls (client-side throttle).
 */
export function createAsyncRateGate(minIntervalMs: number) {
	let lastStart = 0;
	return async function enter(): Promise<void> {
		const now = Date.now();
		const elapsed = now - lastStart;
		if (elapsed < minIntervalMs) {
			await delay(minIntervalMs - elapsed);
		}
		lastStart = Date.now();
	};
}
