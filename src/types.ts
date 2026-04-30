interface GasStation {
	id: number;
	name: string;
	distance: number;
	location: {
		address: string;
		postalCode: string;
		latitude: number;
		longitude: number;
	};
	prices: {
		amount: number;
		fuelType: string;
	}[];
}

export type { GasStation };