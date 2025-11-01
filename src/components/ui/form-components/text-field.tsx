import { useStore } from "@tanstack/react-form";
import { TextField as UITextField } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { type ErrorsObject, formatErrors } from "@/utils/form";

export function TextField({
	label,
	description,
	...props
}: {
	label: string;
	description?: string;
} & React.ComponentProps<typeof UITextField>) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<UITextField
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
				{...props}
			/>
		</div>
	);
}
