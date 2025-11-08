/**
 * Get employment type label in Spanish
 */
export function getEmploymentTypeLabel(type: string): string {
	switch (type) {
		case "HOURLY":
			return "Por Hora";
		case "DAILY":
			return "Por Día";
		case "SUB_CONTRACTOR":
			return "Subcontratista";
		default:
			return type;
	}
}

/**
 * Get short employment type label
 */
export function getEmploymentTypeShort(type: string): string {
	switch (type) {
		case "HOURLY":
			return "Hora";
		case "DAILY":
			return "Día";
		case "SUB_CONTRACTOR":
			return "Sub";
		default:
			return type;
	}
}

/**
 * Daily attendance options
 */
export const DAILY_ATTENDANCE_OPTIONS = [
	{ label: "Completo (1)", value: "1" },
	{ label: "Medio (0.5)", value: "0.5" },
	{ label: "Ausente (0)", value: "0" },
] as const;

/**
 * Get attendance status from value
 */
export function getAttendanceStatus(
	value: string,
): "present" | "partial" | "absent" | "none" {
	if (!value || value === "") return "none";
	const num = Number.parseFloat(value);
	if (num === 0) return "absent";
	if (num >= 1) return "present";
	return "partial";
}

/**
 * Get attendance status color
 */
export function getAttendanceStatusColor(
	status: "present" | "partial" | "absent" | "none",
): string {
	switch (status) {
		case "present":
			return "bg-green-100 text-green-800 border-green-200";
		case "partial":
			return "bg-yellow-100 text-yellow-800 border-yellow-200";
		case "absent":
			return "bg-red-100 text-red-800 border-red-200";
		case "none":
			return "bg-gray-100 text-gray-500 border-gray-200";
	}
}

/**
 * Format attendance value for display
 */
export function formatAttendanceValue(
	value: string,
	employmentType: string,
): string {
	if (!value || value === "") return "-";

	if (employmentType === "DAILY") {
		const num = Number.parseFloat(value);
		if (num === 1) return "Completo";
		if (num === 0.5) return "Medio";
		if (num === 0) return "Ausente";
	}

	return value;
}
