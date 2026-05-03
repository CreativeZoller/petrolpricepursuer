import { useCallback, useEffect, useRef, useState } from "react";
import { createAsyncRateGate } from "../lib/asyncRateGate";
import type { GasStation } from "../types";

const SPRIT_DEBOUNCE_MS = 400;
const SPRIT_MIN_INTERVAL_MS = 1200;

type Coords = { lat: number; lng: number };

type UseSpritStationsOptions = {
	coords: Coords;
	fuelType: "DIE" | "SUP";
	onValidStations: (stations: GasStation[]) => void;
};

function isAbortError(e: unknown): boolean {
	return e instanceof DOMException && e.name === "AbortError";
}

export function useSpritStations({
	coords,
	fuelType,
	onValidStations,
}: UseSpritStationsOptions) {
	const [stations, setStations] = useState<GasStation[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onValidStationsRef = useRef(onValidStations);
	useEffect(() => {
		onValidStationsRef.current = onValidStations;
	}, [onValidStations]);

	const rateGateRef = useRef(createAsyncRateGate(SPRIT_MIN_INTERVAL_MS));

	const clearError = useCallback(() => setError(null), []);

	useEffect(() => {
		const controller = new AbortController();
		let cancelled = false;

		const run = async () => {
			setLoading(true);
			setError(null);
			try {
				await rateGateRef.current();
				if (cancelled) return;

				const params = new URLSearchParams({
					latitude: String(coords.lat),
					longitude: String(coords.lng),
					fuelType,
					includeClosed: "false",
				});
				const url = `/sprit-proxy/1.0/search/gas-stations/by-address?${params}`;

				const res = await fetch(url, { signal: controller.signal });
				if (cancelled) return;
				if (!res.ok) {
					throw new Error(`Sprit API returned ${res.status}`);
				}
				const data: unknown = await res.json();
				const list = Array.isArray(data) ? data : [];
				const valid = (list as GasStation[]).filter(
					(s) => s.prices?.length > 0,
				);
				if (cancelled) return;
				setStations(valid);
				onValidStationsRef.current(valid);
			} catch (e) {
				if (cancelled) return;
				if (isAbortError(e)) return;
				const message =
					e instanceof Error ? e.message : "Could not load station prices.";
				setError(message);
				console.error("Sprit API error:", e);
			} finally {
				setLoading(false);
			}
		};

		const debounceId = globalThis.setTimeout(() => {
			void run();
		}, SPRIT_DEBOUNCE_MS);

		return () => {
			cancelled = true;
			globalThis.clearTimeout(debounceId);
			controller.abort();
		};
	}, [coords.lat, coords.lng, fuelType]);

	return { stations, loading, error, clearError };
}
