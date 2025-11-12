import {
	TextField as AriaTextField,
	TextArea,
	type TextFieldProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { Label } from "./label";
import { Text } from "./text";

const textClasses = tv({
	base: "w-full flex flex-col text-sm mt-1",
	variants: {
		variant: {
			description: "text-gray-600",
			errorMessage: "text-error",
		},
	},
	defaultVariants: {},
});

const textAreaClasses = tv({
	base: "w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px]",
	variants: {
		hasError: {
			true: "border-error focus:ring-error focus:border-error",
			false: "border-gray-300",
		},
	},
	defaultVariants: {
		hasError: false,
	},
});

const labelClasses = tv({
	base: "mb-1 font-medium text-lg",
});

export function TextAreaField({
	label,
	description,
	error,
	className,
	rows = 3,
	...props
}: TextFieldProps & {
	label: string;
	description?: string;
	error?: string;
	rows?: number;
}) {
	return (
		<AriaTextField {...props} className={className || "w-full flex flex-col"}>
			<Label className={labelClasses()}>{label}</Label>
			<TextArea
				className={textAreaClasses({ hasError: !!error })}
				rows={rows}
			/>
			{description && (
				<Text
					slot="description"
					className={textClasses({ variant: "description" })}
				>
					{description}
				</Text>
			)}
			{error && (
				<Text
					slot="errorMessage"
					className={textClasses({ variant: "errorMessage" })}
				>
					{error}
				</Text>
			)}
		</AriaTextField>
	);
}
