import React from "react";
import { Line } from "react-chartjs-2";
import { Clock } from "lucide-react";
import type { GasStation } from "../../types";
import type { FuelUiTheme } from "../../theme/fuelUiTheme";
import {
	STATION_TABLE_COLUMNS,
	type StationSortKey,
} from "../../domain/stationSort";
import { buildStationHistoryView } from "../../domain/stationHistoryView";
import type { FuelPriceHistory } from "../../storage/fuelStorage";

const FORECAST_OFFSETS = [
	{ t: "Tomorrow", delta: 0.01 },
	{ t: "In 2 days", delta: 0.016 },
	{ t: "In 3 days", delta: 0.022 },
] as const;

type StationTableProps = {
	stations: GasStation[];
	history: FuelPriceHistory;
	sortKey: StationSortKey;
	sortDirection: "asc" | "desc";
	onColumnHeaderClick: (key: StationSortKey) => void;
	consumption: number;
	isDarkMode: boolean;
	theme: FuelUiTheme;
	expandedId: number | null;
	onToggleExpand: (id: number) => void;
};

export const StationTable: React.FC<StationTableProps> = ({
	stations,
	history,
	sortKey,
	sortDirection,
	onColumnHeaderClick,
	consumption,
	isDarkMode,
	theme,
	expandedId,
	onToggleExpand,
}) => (
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
					{STATION_TABLE_COLUMNS.map((col) => (
						<th
							key={col.key}
							scope="col"
							onClick={() => onColumnHeaderClick(col.key)}
							style={{ padding: "12px 10px", cursor: "pointer" }}
						>
							{col.label.toUpperCase()}{" "}
							{sortKey === col.key && (sortDirection === "asc" ? "▲" : "▼")}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{stations.map((s) => {
					const price = s.prices[0]?.amount ?? 0;
					const isExpanded = expandedId === s.id;
					const hist = buildStationHistoryView(history, s.id);

					return (
						<React.Fragment key={s.id}>
							<tr
								className="interactive clickable-row"
								tabIndex={0}
								onClick={() => onToggleExpand(s.id)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onToggleExpand(s.id);
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
														Please check back daily. The chart will unlock once
														7 days of real data have been recorded.
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
																	backgroundColor: "rgba(49, 130, 206, 0.1)",
																	fill: true,
																	tension: 0.3,
																	spanGaps: true,
																},
															],
														}}
													/>
												</div>
											)}

											{hist.count >= 7 ? (
												<div
													style={{
														marginTop: "20px",
														display: "grid",
														gridTemplateColumns: "repeat(3, 1fr)",
														gap: "10px",
													}}
												>
													{FORECAST_OFFSETS.map((f) => (
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
																{(price + f.delta).toFixed(3)} €
															</div>
														</div>
													))}
												</div>
											) : null}
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
);
