import type React from "react";
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
		hasLeadingIcon: {
			true: "pl-8",
			false: "",
		},
	},
	defaultVariants: {
		hasError: false,
		hasLeadingIcon: false,
	},
});

const labelClasses = tv({
	base: "mb-1 font-medium text-lg",
});

const inputWrapperClasses = tv({
	base: "relative w-full",
});

const leadingIconClasses = tv({
	base: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none",
});

export function TextField({
	label,
	description,
	error,
	className,
	leadingIcon,
	...props
}: TextFieldProps & {
	label: string;
	description?: string;
	error?: string;
	step?: string;
	leadingIcon?: React.ReactNode;
}) {
	return (
		<AriaTextField {...props} className={className || "w-full flex flex-col"}>
			<Label className={labelClasses()}>{label}</Label>
			<div className={inputWrapperClasses()}>
				{leadingIcon && (
					<div className={leadingIconClasses()}>{leadingIcon}</div>
				)}
				<Input
					className={inputClasses({
						hasError: !!error,
						hasLeadingIcon: !!leadingIcon,
					})}
					step={props.step}
				/>
			</div>
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
