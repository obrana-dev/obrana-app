import { useStore } from "@tanstack/react-form";
import type React from "react";
import { TextField as UITextField } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { type ErrorsObject, formatErrors } from "@/utils/form";
import type { InputFormatter } from "@/utils/formatters";

export function TextField({
	label,
	description,
	leadingIcon,
	formatter,
	...props
}: {
	label: string;
	description?: string;
	leadingIcon?: React.ReactNode;
	formatter?: InputFormatter;
} & React.ComponentProps<typeof UITextField>) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	const handleChange = (value: string) => {
		if (formatter) {
			// Store unformatted value in form state
			const unformatted = formatter.unformat(value);
			field.handleChange(unformatted);
		} else {
			field.handleChange(value);
		}
	};

	const displayValue = formatter
		? formatter.format(field.state.value || "")
		: field.state.value;

	return (
		<div>
			<UITextField
				value={displayValue}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={handleChange}
				label={label}
				description={
					errors.length > 0 && !field.state.meta.isValid
						? undefined
						: description
				}
				error={formatErrors(errors as unknown as ErrorsObject)}
				isInvalid={!field.state.meta.isValid}
				leadingIcon={leadingIcon}
				{...props}
			/>
		</div>
	);
}
