import { useEffect } from "react";
import { useMap } from "react-leaflet";

type RecenterMapProps = { lat: number; lng: number };

export const RecenterMap = ({ lat, lng }: RecenterMapProps) => {
	const map = useMap();
	useEffect(() => {
		map.setView([lat, lng], 13);
	}, [lat, lng, map]);
	return null;
};
