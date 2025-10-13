import { useStore } from "@tanstack/react-form";
import { TextAreaField as UITextAreaField } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { ErrorMessages } from "./error-messages";

export function TextAreaField({
	label,
	rows = 3,
}: {
	label: string;
	rows?: number;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<UITextAreaField
				value={field.state.value}
				onBlur={field.handleBlur}
				label={label}
				TextAreaProps={{ rows }}
				onChange={(value) => field.handleChange(value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
