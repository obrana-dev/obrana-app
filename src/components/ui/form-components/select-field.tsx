import { useStore } from "@tanstack/react-form";
import { Label, Select } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { ErrorMessages } from "./error-messages";

export function SelectField({
	label,
	values,
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<div>
			<Label htmlFor={label} className="block font-bold mb-1 text-xl">
				{label}
			</Label>
			<Select
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(value) =>
					field.handleChange(values.find((v) => v.value === value)?.value || "")
				}
				className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				{values.map((value) => (
					<option key={value.value} value={value.value}>
						{value.label}
					</option>
				))}
			</Select>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
