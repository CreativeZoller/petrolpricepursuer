import { DEFAULT_CONSUMPTION, DEFAULT_COORDS, DEFAULT_SEARCH_TERM } from "../constants/defaults";
import { STORAGE_KEYS } from "./keys";
import type { GasStation } from "../types";

export type FuelPriceHistory = Record<string, Record<string, number>>;

export function parseJsonSafe<T>(raw: string | null, fallback: T): T {
	if (raw == null || raw === "") return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function loadFuelHistory(): FuelPriceHistory {
	return parseJsonSafe<FuelPriceHistory>(
		localStorage.getItem(STORAGE_KEYS.FUEL_HISTORY),
		{},
	);
}

export function loadCoords(): { lat: number; lng: number } {
	const raw = localStorage.getItem(STORAGE_KEYS.COORDS);
	if (!raw) return { ...DEFAULT_COORDS };
	const parsed = parseJsonSafe<unknown>(raw, null);
	if (
		parsed &&
		typeof parsed === "object" &&
		"lat" in parsed &&
		"lng" in parsed &&
		typeof (parsed as { lat: unknown }).lat === "number" &&
		typeof (parsed as { lng: unknown }).lng === "number" &&
		Number.isFinite((parsed as { lat: number }).lat) &&
		Number.isFinite((parsed as { lng: number }).lng)
	) {
		return {
			lat: (parsed as { lat: number }).lat,
			lng: (parsed as { lng: number }).lng,
		};
	}
	return { ...DEFAULT_COORDS };
}

export function loadFuelType(): "DIE" | "SUP" {
	const saved = localStorage.getItem(STORAGE_KEYS.FUEL_TYPE);
	return saved === "SUP" ? "SUP" : "DIE";
}

export function loadSearchTerm(): string {
	return (
		localStorage.getItem(STORAGE_KEYS.SEARCH_TERM) || DEFAULT_SEARCH_TERM
	);
}

export function loadDarkMode(): boolean {
	return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === "true";
}

export function loadConsumption(): number {
	const raw = localStorage.getItem(STORAGE_KEYS.MY_CONSUMPTION);
	if (raw == null || raw === "") return DEFAULT_CONSUMPTION;
	const n = Number.parseFloat(raw);
	return Number.isFinite(n) ? n : DEFAULT_CONSUMPTION;
}

export function persistFuelState(values: {
	consumption: number;
	isDarkMode: boolean;
	searchTerm: string;
	fuelType: "DIE" | "SUP";
	coords: { lat: number; lng: number };
	history: FuelPriceHistory;
}): void {
	localStorage.setItem(
		STORAGE_KEYS.MY_CONSUMPTION,
		values.consumption.toString(),
	);
	localStorage.setItem(
		STORAGE_KEYS.DARK_MODE,
		values.isDarkMode.toString(),
	);
	localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, values.searchTerm);
	localStorage.setItem(STORAGE_KEYS.FUEL_TYPE, values.fuelType);
	localStorage.setItem(
		STORAGE_KEYS.COORDS,
		JSON.stringify(values.coords),
	);
	localStorage.setItem(
		STORAGE_KEYS.FUEL_HISTORY,
		JSON.stringify(values.history),
	);
}

/** Pure merge: same behavior as previous inline setHistory in FuelTracker */
export function mergeTodayPricesIntoHistory(
	prev: FuelPriceHistory,
	valid: GasStation[],
	today: string,
): FuelPriceHistory {
	const updated: FuelPriceHistory = { ...prev };
	valid.forEach((s) => {
		if (!updated[s.id]) updated[s.id] = {};
		updated[s.id][today] = s.prices[0].amount;

		const dates = Object.keys(updated[s.id]).sort();
		if (dates.length > 7) {
			const toDelete = dates.length - 7;
			for (let i = 0; i < toDelete; i++) delete updated[s.id][dates[i]];
		}
	});
	return updated;
}
