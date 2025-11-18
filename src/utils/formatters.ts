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
 * Simple Argentina phone formatter using regex (lightweight alternative)
 * Formats: 11 1234-5678 or similar patterns
 * For full international support, use phone-formatters.ts
 */
export const phoneFormatterAR: InputFormatter = {
	format: (value: string): string => {
		// Remove all non-digit characters
		const cleaned = value.replace(/\D/g, "");

		// Remove leading 54 or +54 if present (country code)
		const withoutCountry = cleaned.replace(/^(54)?/, "");

		// Remove area code 9 if present (mobile indicator)
		const withoutNine = withoutCountry.replace(/^9/, "");

		// Format based on length
		// Expected: 11 1234 5678 (Buenos Aires mobile)
		// or: 11 1234-5678
		if (withoutNine.length === 0) return "";
		if (withoutNine.length <= 2) return withoutNine; // Area code
		if (withoutNine.length <= 6)
			return `${withoutNine.slice(0, 2)} ${withoutNine.slice(2)}`; // 11 1234
		return `${withoutNine.slice(0, 2)} ${withoutNine.slice(2, 6)}-${withoutNine.slice(6, 10)}`; // 11 1234-5678
	},
	unformat: (value: string): string => {
		return value.replace(/\D/g, "");
	},
};

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
