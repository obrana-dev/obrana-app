import {
	TextField as AriaTextField,
	Input,
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

const inputClasses = tv({
	base: "w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
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

export function TextField({
	label,
	description,
	error,
	className,
	...props
}: TextFieldProps & { label: string; description?: string; error?: string }) {
	return (
		<AriaTextField {...props} className={className || "w-full flex flex-col"}>
			<Label className={labelClasses()}>{label}</Label>
			<Input className={inputClasses({ hasError: !!error })} />
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
