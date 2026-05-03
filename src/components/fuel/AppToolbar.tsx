import React from "react";
import { Sun, Moon } from "lucide-react";
import type { FuelUiTheme } from "../../theme/fuelUiTheme";

type AppToolbarProps = {
	title: string;
	isDarkMode: boolean;
	onToggleDarkMode: () => void;
	consumption: number;
	onConsumptionChange: (value: number) => void;
	theme: FuelUiTheme;
};

export const AppToolbar: React.FC<AppToolbarProps> = ({
	title,
	isDarkMode,
	onToggleDarkMode,
	consumption,
	onConsumptionChange,
	theme,
}) => (
	<div
		style={{
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: "20px",
		}}
	>
		<h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{title}</h1>
		<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
			<button
				type="button"
				className="interactive"
				onClick={onToggleDarkMode}
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
					htmlFor="consumption-input"
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
					id="consumption-input"
					className="interactive"
					type="number"
					value={consumption}
					onChange={(e) =>
						onConsumptionChange(Number.parseFloat(e.target.value) || 0)
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
);
