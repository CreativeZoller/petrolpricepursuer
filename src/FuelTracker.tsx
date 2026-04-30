import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Line } from "react-chartjs-2";
import { Search, Sun, Moon, Clock } from "lucide-react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import type { GasStation } from "./types";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
);

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
	const map = useMap();
	useEffect(() => {
		map.setView([lat, lng], 13);
	}, [lat, lng, map]);
	return null;
};

const FuelTracker: React.FC = () => {
	const [stations, setStations] = useState<GasStation[]>([]);

	const [history, setHistory] = useState<{
		[key: string]: { [date: string]: number };
	}>(() => {
		const saved = localStorage.getItem("fuel_history_data");
		return saved ? JSON.parse(saved) : {};
	});

	const [fuelType, setFuelType] = useState<"DIE" | "SUP">(() => {
		const saved = localStorage.getItem("fuelType");
		return saved === "SUP" ? "SUP" : "DIE";
	});

	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("searchTerm") || "Graz",
	);
	const [coords, setCoords] = useState(() => {
		const saved = localStorage.getItem("coords");
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				return { lat: 47.0707, lng: 15.4395 };
			}
		}
		return { lat: 47.0707, lng: 15.4395 };
	});

	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [sortKey, setSortKey] = useState<
		"name" | "address" | "distance" | "price" | "cost"
	>("price");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [isDarkMode, setIsDarkMode] = useState<boolean>(
		() => localStorage.getItem("darkMode") === "true",
	);
	const [consumption, setConsumption] = useState<number>(() => {
		const saved = localStorage.getItem("myConsumption");
		return saved ? parseFloat(saved) : 6.5;
	});

	useEffect(() => {
		localStorage.setItem("myConsumption", consumption.toString());
		localStorage.setItem("darkMode", isDarkMode.toString());
		localStorage.setItem("searchTerm", searchTerm);
		localStorage.setItem("fuelType", fuelType);
		localStorage.setItem("coords", JSON.stringify(coords));
		localStorage.setItem("fuel_history_data", JSON.stringify(history));
	}, [consumption, isDarkMode, searchTerm, fuelType, coords, history]);

	const theme = {
		bg: isDarkMode ? "#1a202c" : "#f7fafc",
		card: isDarkMode ? "#2d3748" : "#ffffff",
		text: isDarkMode ? "#f7fafc" : "#1a202c",
		subText: isDarkMode ? "#a0aec0" : "#718096",
		border: isDarkMode ? "#4a5568" : "#e2e8f0",
		accent: "#3182ce",
		inputBg: isDarkMode ? "#2d3748" : "#ffffff",
	};

	const handleSearch = async () => {
		if (!searchTerm.trim()) return;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchTerm,
				)}`,
			);
			const data = await res.json();
			if (data && data.length > 0) {
				setCoords({
					lat: parseFloat(data[0].lat),
					lng: parseFloat(data[0].lon),
				});
			}
		} catch (err) {
			console.error("Location search error:", err);
		}
	};

	useEffect(() => {
		const apiUri = `https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=${coords.lat}&longitude=${coords.lng}&fuelType=${fuelType}&includeClosed=false`;
		const url = `https://corsproxy.io/?${encodeURIComponent(apiUri)}`;

		fetch(url)
			.then((res) => res.json())
			.then((data: GasStation[]) => {
				const valid = (Array.isArray(data) ? data : []).filter(
					(s) => s.prices?.length > 0,
				);
				setStations(valid);

				const today = new Date().toISOString().split("T")[0];
				setHistory((prev) => {
					const updated = { ...prev };
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
				});
			})
			.catch((err) => console.error("API error:", err));
	}, [coords, fuelType]);

	const getStationHistory = (stationId: number) => {
		const labels = [];
		const values = [];
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
	};

	const sortedStations = useMemo(() => {
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
	}, [stations, sortKey, sortDirection, consumption]);

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
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "20px",
					}}
				>
					<h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
						Fuel Price Checker
					</h1>
					<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
						<button
							className="interactive"
							onClick={() => setIsDarkMode(!isDarkMode)}
							style={{
								background: theme.card,
								border: `1px solid ${theme.border}`,
								cursor: "pointer",
								color: theme.accent,
								padding: "8px",
								borderRadius: "10px",
								display: "flex",
							}}
						>
							{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
						</button>
						<div
							style={{
								background: theme.card,
								padding: "8px 12px",
								borderRadius: "10px",
								border: `1px solid ${theme.border}`,
							}}
						>
							<label
								style={{
									fontSize: "10px",
									color: theme.subText,
									fontWeight: "bold",
									display: "block",
								}}
							>
								L/100KM
							</label>
							<input
								className="interactive"
									type="number"
								value={consumption}
								onChange={(e) =>
									setConsumption(parseFloat(e.target.value) || 0)
								}
								style={{
									background: "transparent",
									border: "none",
									color: theme.text,
									fontSize: "16px",
									fontWeight: "bold",
									width: "45px",
									outline: "none",
								}}
							/>
						</div>
					</div>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "15px",
						marginBottom: "20px",
					}}
				>
					<div style={{ display: "flex", gap: "8px" }}>
						<input
							className="interactive"
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							style={{
								flex: 1,
								padding: "10px",
								borderRadius: "10px",
								border: `1px solid ${theme.border}`,
								background: theme.inputBg,
								color: theme.text,
							}}
							placeholder="City..."
						/>
						<button
							className="interactive"
							onClick={handleSearch}
							style={{
								background: theme.accent,
								color: "white",
								border: "none",
								borderRadius: "10px",
								padding: "0 12px",
								cursor: "pointer",
							}}
						>
							<Search size={18} />
						</button>
					</div>
					<div
						style={{
							display: "flex",
							background: isDarkMode ? "#4a5568" : "#edf2f7",
							padding: "4px",
							borderRadius: "12px",
						}}
					>
						{(["DIE", "SUP"] as const).map((type) => (
							<button
								className="interactive"
									key={type}
								onClick={() => setFuelType(type)}
								style={{
									flex: 1,
									border: "none",
									borderRadius: "9px",
									padding: "8px",
									fontWeight: "bold",
									cursor: "pointer",
									background:
										fuelType === type
											? isDarkMode
												? "#2d3748"
												: "white"
											: "transparent",
									color: fuelType === type ? theme.text : theme.subText,
								}}
							>
								{type === "DIE" ? "Diesel" : "Petrol"}
							</button>
						))}
					</div>
				</div>

				<div
					style={{
						height: "300px",
						borderRadius: "15px",
						overflow: "hidden",
						marginBottom: "25px",
						border: `4px solid ${theme.card}`,
						filter: isDarkMode
							? "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)"
							: "none",
					}}
				>
					<MapContainer
						center={[coords.lat, coords.lng]}
						zoom={13}
						style={{ height: "100%", width: "100%" }}
					>
						<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
						<RecenterMap lat={coords.lat} lng={coords.lng} />
						{stations.map((s) => (
							<Marker
								key={s.id}
								position={[s.location.latitude, s.location.longitude]}
							>
								<Popup>
									{s.name}: {s.prices[0]?.amount}€
								</Popup>
							</Marker>
						))}
					</MapContainer>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							background: theme.card,
							color: theme.text,
							borderRadius: "12px",
							overflow: "hidden",
						}}
					>
						<thead>
							<tr
								style={{
									borderBottom: `2px solid ${theme.border}`,
									textAlign: "left",
									fontSize: "12px",
									color: theme.subText,
								}}
							>
								{[
									{ l: "Station", k: "name" },
									{ l: "Address", k: "address" },
									{ l: "Dist.", k: "distance" },
									{ l: "Price", k: "price" },
									{ l: "Cost/100", k: "cost" },
								].map((col) => (
									<th
										key={col.k}
										onClick={() => {
											setSortKey(col.k as any);
											setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
										}}
										style={{ padding: "12px 10px", cursor: "pointer" }}
									>
										{col.l.toUpperCase()}{" "}
										{sortKey === col.k && (sortDirection === "asc" ? "▲" : "▼")}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{sortedStations.map((s) => {
								const price = s.prices[0]?.amount ?? 0;
								const isExpanded = expandedId === s.id;
								const hist = getStationHistory(s.id);

								return (
									<React.Fragment key={s.id}>
										<tr
											className="interactive clickable-row"
										tabIndex={0}
										onClick={() => setExpandedId(isExpanded ? null : s.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setExpandedId(isExpanded ? null : s.id);
											}
										}}
											style={{
												cursor: "pointer",
												borderBottom: `1px solid ${theme.border}`,
												background: isExpanded
													? isDarkMode
														? "#2a2f38"
														: "#f8fafc"
													: "transparent",
											}}
										>
											<td style={{ padding: "14px 10px", fontWeight: "600" }}>
												{s.name}
											</td>
											<td style={{ padding: "14px 10px", fontSize: "12px" }}>
												{s.location.address}
											</td>
											<td style={{ padding: "14px 10px" }}>
												{s.distance.toFixed(1)} km
											</td>
											<td style={{ padding: "14px 10px", fontWeight: "bold" }}>
												{price.toFixed(3)} €
											</td>
											<td
												style={{
													padding: "14px 10px",
													fontWeight: "bold",
													color: theme.accent,
												}}
											>
												{(price * consumption).toFixed(2)} €
											</td>
										</tr>
										{isExpanded && (
											<tr>
												<td colSpan={5} style={{ padding: "20px" }}>
													<div
														style={{
															background: theme.bg,
															padding: "20px",
															borderRadius: "15px",
															border: `1px solid ${theme.border}`,
														}}
													>
														<div
															style={{
																marginBottom: "15px",
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
															}}
														>
															<h4
																style={{
																	margin: 0,
																	fontSize: "14px",
																	fontWeight: "bold",
																}}
															>
																7-Day Price History
															</h4>
															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: "8px",
																	fontSize: "12px",
																	color:
																		hist.count < 7 ? "#d69e2e" : theme.accent,
																	fontWeight: "bold",
																}}
															>
																<Clock size={14} />
																{hist.count}/7 days collected
															</div>
														</div>

														{hist.count < 7 ? (
															<div
																style={{
																	height: "180px",
																	display: "flex",
																	flexDirection: "column",
																	alignItems: "center",
																	justifyContent: "center",
																	background: theme.card,
																	borderRadius: "12px",
																	border: `2px dashed ${theme.border}`,
																	color: theme.subText,
																	textAlign: "center",
																	padding: "20px",
																}}
															>
																<div
																	style={{
																		fontSize: "16px",
																		fontWeight: "bold",
																		marginBottom: "8px",
																		color: theme.text,
																	}}
																>
																	Generating History...
																</div>
																<div
																	style={{
																		fontSize: "13px",
																		maxWidth: "250px",
																	}}
																>
																	Please check back daily. The chart will unlock
																	once 7 days of real data have been recorded.
																</div>
																<div
																	style={{
																		marginTop: "15px",
																		width: "100%",
																		background: theme.border,
																		height: "6px",
																		borderRadius: "3px",
																		overflow: "hidden",
																	}}
																>
																	<div
																		style={{
																			width: `${(hist.count / 7) * 100}%`,
																			background: theme.accent,
																			height: "100%",
																			transition: "width 0.5s ease",
																		}}
																	/>
																</div>
															</div>
														) : (
															<div style={{ height: "180px" }}>
																<Line
																	options={{
																		responsive: true,
																		maintainAspectRatio: false,
																		plugins: { legend: { display: false } },
																		scales: {
																			y: { ticks: { color: theme.subText } },
																			x: { ticks: { color: theme.subText } },
																		},
																	}}
																	data={{
																		labels: hist.labels,
																		datasets: [
																			{
																				label: "Price",
																				data: hist.values,
																				borderColor: theme.accent,
																				backgroundColor:
																					"rgba(49, 130, 206, 0.1)",
																				fill: true,
																				tension: 0.3,
																				spanGaps: true,
																			},
																		],
																	}}
																/>
															</div>
														)}

														<div
															style={{
																marginTop: "20px",
																display: "grid",
																gridTemplateColumns: "repeat(3, 1fr)",
																gap: "10px",
															}}
														>
															{[
																{ t: "Tomorrow", v: price + 0.01 },
																{ t: "In 2 days", v: price + 0.016 },
																{ t: "In 3 days", v: price + 0.022 },
															].map((f) => (
																<div
																	key={f.t}
																	style={{
																		padding: "10px",
																		background: theme.card,
																		borderRadius: "10px",
																		border: `1px solid ${theme.border}`,
																		textAlign: "center",
																	}}
																>
																	<div
																		style={{
																			fontSize: "10px",
																			color: theme.subText,
																			marginBottom: "4px",
																		}}
																	>
																		{f.t.toUpperCase()}
																	</div>
																	<div
																		style={{
																			fontWeight: "bold",
																			fontSize: "14px",
																		}}
																	>
																		{f.v.toFixed(3)} €
																	</div>
																</div>
															))}
														</div>
													</div>
												</td>
											</tr>
										)}
									</React.Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default FuelTracker;
