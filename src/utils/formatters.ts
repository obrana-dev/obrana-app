/**
 * Input formatting utilities
 * These functions format and unformat input values for better UX
 *
 * @example Creating a custom formatter
 * ```tsx
 * import { type InputFormatter } from "@/utils/formatters";
 *
 * const creditCardFormatter: InputFormatter = {
 *   format: (value: string) => {
 *     const cleaned = value.replace(/\D/g, "");
 *     const groups = cleaned.match(/.{1,4}/g) || [];
 *     return groups.join(" ");
 *   },
 *   unformat: (value: string) => {
 *     return value.replace(/\s/g, "");
 *   },
 * };
 *
 * // Usage in a form field:
 * <field.TextField
 *   label="Card Number"
 *   formatter={creditCardFormatter}
 * />
 * ```
 */
import {
	type CountryCode,
	formatIncompletePhoneNumber,
	parsePhoneNumber,
} from "libphonenumber-js";

export interface InputFormatter {
	format: (value: string) => string;
	unformat: (value: string) => string;
}

/**
 * Currency formatter - adds thousand separators
 * Example: "1234.56" -> "1,234.56"
 */
export const currencyFormatter: InputFormatter = {
	format: (value: string): string => {
		// Remove all non-digit and non-decimal characters
		const cleaned = value.replace(/[^\d.]/g, "");

		// Handle multiple decimal points - keep only the first one
		const parts = cleaned.split(".");
		const integerPart = parts[0] || "";
		const decimalPart = parts[1] || "";

		// Add thousand separators to integer part
		const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		// Combine with decimal part if it exists
		return decimalPart ? `${formatted}.${decimalPart}` : formatted;
	},
	unformat: (value: string): string => {
		return value.replace(/,/g, "");
	},
};

/**
 * Phone formatter - formats phone numbers (US format)
 * Example: "1234567890" -> "(123) 456-7890"
 * @deprecated Use phoneFormatterAR for Argentina numbers or createPhoneFormatter for other countries
 */
export const phoneFormatter: InputFormatter = {
	format: (value: string): string => {
		// Remove all non-digit characters
		const cleaned = value.replace(/\D/g, "");

		// Format based on length
		if (cleaned.length === 0) return "";
		if (cleaned.length <= 3) return cleaned;
		if (cleaned.length <= 6)
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
		return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
	},
	unformat: (value: string): string => {
		return value.replace(/\D/g, "");
	},
};

/**
 * International phone formatter using libphonenumber-js
 * Supports Argentina and other countries
 */

/**
 * Creates a phone formatter for a specific country
 * @param country - ISO 3166-1 alpha-2 country code (e.g., "AR" for Argentina, "US" for USA)
 * @returns InputFormatter for phone numbers
 *
 * @example
 * ```tsx
 * const argentinaPhoneFormatter = createPhoneFormatter("AR");
 * <field.TextField formatter={argentinaPhoneFormatter} />
 * ```
 */
export function createPhoneFormatter(country: CountryCode): InputFormatter {
	return {
		format: (value: string): string => {
			if (!value) return "";
			// Format as user types, showing a partial number
			return formatIncompletePhoneNumber(value, country);
		},
		unformat: (value: string): string => {
			try {
				// Parse and return in E.164 format (e.g., +541112345678)
				const phoneNumber = parsePhoneNumber(value, country);
				if (phoneNumber) {
					return phoneNumber.number;
				}
			} catch {
				// If parsing fails, just remove formatting characters
				return value.replace(/[\s()-]/g, "");
			}
			return value.replace(/[\s()-]/g, "");
		},
	};
}

/**
 * Argentina phone formatter
 * Formats: +54 9 11 1234-5678 (mobile) or +54 11 1234-5678 (landline)
 */
export const phoneFormatterAR = createPhoneFormatter("AR");

/**
 * Percentage formatter - adds % symbol
 * Example: "12.5" -> "12.5%"
 */
export const percentageFormatter: InputFormatter = {
	format: (value: string): string => {
		const cleaned = value.replace(/[^\d.]/g, "");
		if (!cleaned) return "";
		return `${cleaned}%`;
	},
	unformat: (value: string): string => {
		return value.replace(/%/g, "");
	},
};

/**
 * Number formatter - only allows digits and decimal
 * Example: "abc123.45def" -> "123.45"
 */
export const numberFormatter: InputFormatter = {
	format: (value: string): string => {
		return value.replace(/[^\d.]/g, "");
	},
	unformat: (value: string): string => {
		return value;
	},
};
