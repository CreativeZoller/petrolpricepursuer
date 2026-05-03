import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBanner } from "./components/ErrorBanner";
import { AppToolbar } from "./components/fuel/AppToolbar";
import { SearchAndFuelControls } from "./components/fuel/SearchAndFuelControls";
import { StationMap } from "./components/fuel/StationMap";
import { StationTable } from "./components/fuel/StationTable";
import { sortStations, type StationSortKey } from "./domain/stationSort";
import { useNominatimSearch } from "./hooks/useNominatimSearch";
import { useSpritStations } from "./hooks/useSpritStations";
import {
	loadConsumption,
	loadCoords,
	loadDarkMode,
	loadFuelHistory,
	loadFuelType,
	loadSearchTerm,
	mergeTodayPricesIntoHistory,
	persistFuelState,
	type FuelPriceHistory,
} from "./storage/fuelStorage";
import { buildFuelUiTheme } from "./theme/fuelUiTheme";
import type { GasStation } from "./types";

const FuelTracker: React.FC = () => {
	const [history, setHistory] = useState<FuelPriceHistory>(loadFuelHistory);
	const [fuelType, setFuelType] = useState<"DIE" | "SUP">(loadFuelType);
	const [searchTerm, setSearchTerm] = useState(loadSearchTerm);
	const [coords, setCoords] = useState(loadCoords);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [sortKey, setSortKey] = useState<StationSortKey>("price");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [isDarkMode, setIsDarkMode] = useState(loadDarkMode);
	const [consumption, setConsumption] = useState(loadConsumption);

	const onCoordsFound = useCallback(
		(next: { lat: number; lng: number }) => {
			setCoords(next);
		},
		[],
	);

	const { searchLocation, searchError, clearSearchError } =
		useNominatimSearch({ onCoordsFound });

	const onValidStations = useCallback((valid: GasStation[]) => {
		const today = new Date().toISOString().split("T")[0];
		setHistory((prev) => mergeTodayPricesIntoHistory(prev, valid, today));
	}, []);

	const { stations, loading, error: spritError, clearError: clearSpritError } =
		useSpritStations({ coords, fuelType, onValidStations });

	useEffect(() => {
		persistFuelState({
			consumption,
			isDarkMode,
			searchTerm,
			fuelType,
			coords,
			history,
		});
	}, [consumption, isDarkMode, searchTerm, fuelType, coords, history]);

	const theme = useMemo(() => buildFuelUiTheme(isDarkMode), [isDarkMode]);

	const handleSearch = useCallback(() => {
		void searchLocation(searchTerm);
	}, [searchLocation, searchTerm]);

	const sortedStations = useMemo(
		() => sortStations(stations, sortKey, sortDirection, consumption),
		[stations, sortKey, sortDirection, consumption],
	);

	const handleColumnHeaderClick = useCallback((key: StationSortKey) => {
		setSortKey(key);
		setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
	}, []);

	const handleToggleRow = useCallback((id: number) => {
		setExpandedId((cur) => (cur === id ? null : id));
	}, []);

	return (
		<div
			style={{
				background: theme.bg,
				color: theme.text,
				minHeight: "100vh",
				padding: "20px",
				transition: "all 0.3s ease",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ maxWidth: "800px", margin: "0 auto" }}>
				<AppToolbar
					title="Fuel Price Checker"
					isDarkMode={isDarkMode}
					onToggleDarkMode={() => setIsDarkMode((v) => !v)}
					consumption={consumption}
					onConsumptionChange={setConsumption}
					theme={theme}
				/>

				<SearchAndFuelControls
					searchTerm={searchTerm}
					onSearchTermChange={(v) => {
						setSearchTerm(v);
						clearSearchError();
					}}
					onSearchSubmit={handleSearch}
					searchError={searchError}
					fuelType={fuelType}
					onFuelTypeChange={setFuelType}
					isDarkMode={isDarkMode}
					theme={theme}
				/>

				{spritError ? (
					<ErrorBanner
						message={spritError}
						onDismiss={clearSpritError}
						theme={theme}
					/>
				) : null}

				<StationMap
					coords={coords}
					stations={stations}
					isDarkMode={isDarkMode}
					theme={theme}
					loading={loading}
				/>

				<StationTable
					stations={sortedStations}
					history={history}
					sortKey={sortKey}
					sortDirection={sortDirection}
					onColumnHeaderClick={handleColumnHeaderClick}
					consumption={consumption}
					isDarkMode={isDarkMode}
					theme={theme}
					expandedId={expandedId}
					onToggleExpand={handleToggleRow}
				/>
			</div>
		</div>
	);
};

export default FuelTracker;
