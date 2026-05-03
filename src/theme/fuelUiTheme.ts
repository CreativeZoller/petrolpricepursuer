export type FuelUiTheme = {
	bg: string;
	card: string;
	text: string;
	subText: string;
	border: string;
	accent: string;
	inputBg: string;
};

export function buildFuelUiTheme(isDarkMode: boolean): FuelUiTheme {
	return {
		bg: isDarkMode ? "#1a202c" : "#f7fafc",
		card: isDarkMode ? "#2d3748" : "#ffffff",
		text: isDarkMode ? "#f7fafc" : "#1a202c",
		subText: isDarkMode ? "#a0aec0" : "#718096",
		border: isDarkMode ? "#4a5568" : "#e2e8f0",
		accent: "#3182ce",
		inputBg: isDarkMode ? "#2d3748" : "#ffffff",
	};
}
