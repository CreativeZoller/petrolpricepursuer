import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { GasStation } from "../../types";
import type { FuelUiTheme } from "../../theme/fuelUiTheme";
import { RecenterMap } from "./RecenterMap";

type StationMapProps = {
	coords: { lat: number; lng: number };
	stations: GasStation[];
	isDarkMode: boolean;
	theme: FuelUiTheme;
	loading: boolean;
};

export const StationMap: React.FC<StationMapProps> = ({
	coords,
	stations,
	isDarkMode,
	theme,
	loading,
}) => (
	<div
		style={{
			position: "relative",
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
		{loading ? (
			<div
				style={{
					position: "absolute",
					zIndex: 2,
					top: "10px",
					left: "50%",
					transform: "translateX(-50%)",
					padding: "6px 12px",
					borderRadius: "8px",
					background: "rgba(255,255,255,0.9)",
					color: "#1a202c",
					fontSize: "12px",
					fontWeight: 600,
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
					pointerEvents: "none",
				}}
			>
				Loading stations…
			</div>
		) : null}
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
);
