import React from "react";
import { Search } from "lucide-react";
import type { FuelUiTheme } from "../../theme/fuelUiTheme";

type SearchAndFuelControlsProps = {
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	onSearchSubmit: () => void;
	searchError: string | null;
	fuelType: "DIE" | "SUP";
	onFuelTypeChange: (type: "DIE" | "SUP") => void;
	isDarkMode: boolean;
	theme: FuelUiTheme;
};

export const SearchAndFuelControls: React.FC<SearchAndFuelControlsProps> = ({
	searchTerm,
	onSearchTermChange,
	onSearchSubmit,
	searchError,
	fuelType,
	onFuelTypeChange,
	isDarkMode,
	theme,
}) => (
	<div style={{ marginBottom: "15px" }}>
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "15px",
				marginBottom: searchError ? "8px" : 0,
			}}
		>
			<div style={{ display: "flex", gap: "8px" }}>
				<input
					className="interactive"
					type="text"
					value={searchTerm}
					onChange={(e) => onSearchTermChange(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
					style={{
						flex: 1,
						padding: "10px",
						borderRadius: "10px",
						border: `1px solid ${theme.border}`,
						background: theme.inputBg,
						color: theme.text,
					}}
					placeholder="City..."
					aria-invalid={searchError ? true : undefined}
					aria-describedby={searchError ? "search-error-msg" : undefined}
				/>
				<button
					type="button"
					className="interactive"
					onClick={onSearchSubmit}
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
						type="button"
						className="interactive"
						key={type}
						onClick={() => onFuelTypeChange(type)}
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
		{searchError ? (
			<p
				id="search-error-msg"
				role="status"
				style={{
					margin: 0,
					fontSize: "13px",
					color: "#c53030",
					paddingLeft: "4px",
				}}
			>
				{searchError}
			</p>
		) : null}
	</div>
);
