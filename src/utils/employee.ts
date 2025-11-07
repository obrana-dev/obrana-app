import { Briefcase, Clock, Users, type LucideIcon } from "lucide-react";

/**
 * Get initials from first and last name
 */
export function getInitials(firstName: string, lastName: string): string {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Employment type configuration
 */
export interface EmploymentTypeInfo {
	label: string;
	icon: LucideIcon;
	color: string;
}

/**
 * Get employment type label, icon and color
 */
export function getEmploymentTypeInfo(type: string): EmploymentTypeInfo {
	switch (type) {
		case "HOURLY":
			return {
				label: "Por Hora",
				icon: Clock,
				color: "bg-blue-100 text-blue-700",
			};
		case "DAILY":
			return {
				label: "Por Día",
				icon: Briefcase,
				color: "bg-green-100 text-green-700",
			};
		case "SUB_CONTRACTOR":
			return {
				label: "Subcontratista",
				icon: Users,
				color: "bg-purple-100 text-purple-700",
			};
		default:
			return {
				label: type,
				icon: Briefcase,
				color: "bg-gray-100 text-gray-700",
			};
	}
}

/**
 * Employment type options for select fields
 */
export const EMPLOYMENT_TYPE_OPTIONS = [
	{ label: "Por Hora", value: "HOURLY" },
	{ label: "Por Día (Jornal)", value: "DAILY" },
	{ label: "Subcontratista", value: "SUB_CONTRACTOR" },
] as const;

/**
 * Pay frequency options for select fields
 */
export const PAY_FREQUENCY_OPTIONS = [
	{ label: "Semanal", value: "WEEKLY" },
	{ label: "Quincenal", value: "BI_WEEKLY" },
	{ label: "Mensual", value: "MONTHLY" },
] as const;
