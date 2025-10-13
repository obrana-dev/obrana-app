import { useStore } from "@tanstack/react-form";
import { TextField as UITextField } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { ErrorMessages } from "./error-messages";

export function TextField({
	label,
	description,
}: {
	label: string;
	description?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<UITextField
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(value) => field.handleChange(value)}
				label={label}
				description={
					errors && field.state.meta.isTouched ? undefined : description
				}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
