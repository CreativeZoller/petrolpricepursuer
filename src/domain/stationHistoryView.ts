import type { FuelPriceHistory } from "../storage/fuelStorage";

export function buildStationHistoryView(
	history: FuelPriceHistory,
	stationId: number,
): { labels: string[]; values: (number | null)[]; count: number } {
	const labels: string[] = [];
	const values: (number | null)[] = [];
	const stationData = history[stationId] || {};
	const uniqueDaysCount = Object.keys(stationData).length;

	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dateStr = d.toISOString().split("T")[0];

		labels.push(i === 0 ? "Today" : `${i}d ago`);

		if (stationData[dateStr] !== undefined) {
			values.push(stationData[dateStr]);
		} else {
			values.push(null);
		}
	}
	return { labels, values, count: uniqueDaysCount };
}
