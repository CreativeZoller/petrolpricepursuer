import { useCallback, useRef, useState } from "react";

type Coords = { lat: number; lng: number };

type UseNominatimSearchOptions = {
	onCoordsFound: (coords: Coords) => void;
};

export function useNominatimSearch({ onCoordsFound }: UseNominatimSearchOptions) {
	const [searchError, setSearchError] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const clearSearchError = useCallback(() => setSearchError(null), []);

	const searchLocation = useCallback(
		async (searchTerm: string) => {
			if (!searchTerm.trim()) return;

			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setSearchError(null);
			try {
				const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchTerm,
				)}`;
				const res = await fetch(url, {
					signal: controller.signal,
					headers: { Accept: "application/json" },
				});
				if (!res.ok) {
					throw new Error(`Geocoder returned ${res.status}`);
				}
				const data: unknown = await res.json();
				if (!Array.isArray(data) || data.length === 0) {
					setSearchError("No places found for that query.");
					return;
				}
				const first = data[0] as { lat?: string; lon?: string };
				const lat = Number.parseFloat(String(first.lat));
				const lng = Number.parseFloat(String(first.lon));
				if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
					setSearchError("Could not read coordinates for that result.");
					return;
				}
				onCoordsFound({ lat, lng });
			} catch (e) {
				if (e instanceof DOMException && e.name === "AbortError") return;
				setSearchError("Location search could not complete.");
				console.error("Location search error:", e);
			}
		},
		[onCoordsFound],
	);

	return { searchLocation, searchError, clearSearchError };
}
