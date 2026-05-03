import type { GasStation } from "../types";

export type StationSortKey = "name" | "address" | "distance" | "price" | "cost";

export function sortStations(
	stations: GasStation[],
	sortKey: StationSortKey,
	sortDirection: "asc" | "desc",
	consumption: number,
): GasStation[] {
	return [...stations].sort((a, b) => {
		const aP = a.prices[0]?.amount ?? 0;
		const bP = b.prices[0]?.amount ?? 0;
		let res = 0;
		if (sortKey === "name") res = a.name.localeCompare(b.name);
		else if (sortKey === "address")
			res = a.location.address.localeCompare(b.location.address);
		else if (sortKey === "distance") res = a.distance - b.distance;
		else if (sortKey === "price") res = aP - bP;
		else if (sortKey === "cost") res = aP * consumption - bP * consumption;
		return sortDirection === "asc" ? res : -res;
	});
}

export const STATION_TABLE_COLUMNS: { label: string; key: StationSortKey }[] = [
	{ label: "Station", key: "name" },
	{ label: "Address", key: "address" },
	{ label: "Dist.", key: "distance" },
	{ label: "Price", key: "price" },
	{ label: "Cost/100", key: "cost" },
];
