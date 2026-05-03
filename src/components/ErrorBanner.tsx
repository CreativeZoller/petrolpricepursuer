import React from "react";

type ErrorBannerProps = {
	message: string;
	onDismiss: () => void;
	theme: { card: string; border: string; text: string; subText: string };
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
	message,
	onDismiss,
	theme,
}) => (
	<div
		role="alert"
		style={{
			display: "flex",
			alignItems: "flex-start",
			justifyContent: "space-between",
			gap: "12px",
			padding: "12px 14px",
			marginBottom: "16px",
			borderRadius: "12px",
			border: `1px solid ${theme.border}`,
			background: theme.card,
			color: theme.text,
			fontSize: "14px",
		}}
	>
		<span style={{ flex: 1 }}>{message}</span>
		<button
			type="button"
			className="interactive"
			onClick={onDismiss}
			style={{
				flexShrink: 0,
				border: "none",
				background: "transparent",
				color: theme.subText,
				cursor: "pointer",
				fontSize: "18px",
				lineHeight: 1,
				padding: "2px 6px",
			}}
			aria-label="Dismiss"
		>
			×
		</button>
	</div>
);
