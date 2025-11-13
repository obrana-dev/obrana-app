/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given week start date
 */
export function getWeekEnd(weekStart: Date): Date {
	const d = new Date(weekStart);
	d.setDate(d.getDate() + 6);
	return d;
}

/**
 * Get the start of the month for a given date
 */
export function getMonthStart(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the end of the month for a given date
 */
export function getMonthEnd(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Get array of dates for the week starting from a given date
 */
export function getWeekDates(weekStart: Date): Date[] {
	const dates = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + i);
		dates.push(date);
	}
	return dates;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
	const day = date.getDay();
	return day === 0 || day === 6;
}

/**
 * Day names in Spanish
 */
export const DAY_NAMES = [
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
	"Domingo",
];

/**
 * Short day names in Spanish
 */
export const DAY_NAMES_SHORT = [
	"Lun",
	"Mar",
	"Mié",
	"Jue",
	"Vie",
	"Sáb",
	"Dom",
];

/**
 * Format date range in Spanish
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
	return `${startDate.toLocaleDateString("es-AR")} - ${endDate.toLocaleDateString("es-AR")}`;
}
