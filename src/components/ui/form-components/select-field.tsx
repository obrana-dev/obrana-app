import { useStore } from "@tanstack/react-form";
import { ChevronDown } from "lucide-react";
import {
	Button,
	ListBox,
	ListBoxItem,
	SelectValue,
} from "react-aria-components";
import { Label, Select } from "@/components/ui";
import { useFieldContext } from "@/hooks/form-context";
import { Popover } from "../menu";
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
				aria-labelledby={`label-${field.name}`}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(value) => field.handleChange(value as string)}
				className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				<Button className="w-full flex justify-between items-center">
					<SelectValue />
					<span aria-hidden="true">
						<ChevronDown size={16} />
					</span>
				</Button>
				<Popover>
					<ListBox className="max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
						{values.map((value) => (
							<ListBoxItem
								key={value.value}
								id={value.value}
								className="w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
							>
								{value.label}
							</ListBoxItem>
						))}
					</ListBox>
				</Popover>
			</Select>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</div>
	);
}
