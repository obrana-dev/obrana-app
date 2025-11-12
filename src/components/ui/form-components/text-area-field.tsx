import { useStore } from "@tanstack/react-form";
import { TextAreaField as UITextAreaField } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { type ErrorsObject, formatErrors } from "@/utils/form";

export function TextAreaField({
	label,
	description,
	rows = 3,
	...props
}: {
	label: string;
	description?: string;
	rows?: number;
} & React.ComponentProps<typeof UITextAreaField>) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<UITextAreaField
				value={field.state.value}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(value) => field.handleChange(value)}
				label={label}
				description={
					errors.length > 0 && !field.state.meta.isValid
						? undefined
						: description
				}
				error={formatErrors(errors as unknown as ErrorsObject)}
				isInvalid={!field.state.meta.isValid}
				rows={rows}
				{...props}
			/>
		</div>
	);
}
