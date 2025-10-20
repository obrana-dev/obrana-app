import { Button as AriaButton, type ButtonProps } from "react-aria-components";
import { tv } from "tailwind-variants";

const classes = tv({
	base: "rounded-md data-[pressed]:scale-97 transition-transform duration-[0.16s] ease-out-quad",
	variants: {
		size: {
			sm: "px-3 py-1.5 text-sm",
			md: "px-4 py-2 text-base",
			lg: "px-5 py-3 text-lg",
		},
		color: {
			primary:
				"bg-blue-600 text-white data-[hovered]:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed",
			secondary:
				"bg-gray-600 text-white data-[hovered]:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
			ghost:
				"bg-transparent text-gray-800 data-[hovered]:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
		},
		variant: {
			outlined: "border border-current",
			contained: "",
			text: "bg-transparent",
		},
	},

	defaultVariants: {
		size: "md",
		color: "primary",
		variant: "contained",
	},
});
export function Button({
	size,
	color,
	variant,
	...props
}: ButtonProps & {
	size?: "sm" | "md" | "lg";
	color?: "primary" | "secondary" | "ghost";
	variant?: "outlined" | "contained" | "text";
}) {
	return (
		<AriaButton
			{...props}
			className={classes({
				size,
				color,
				variant,
				class: props.className as string,
			})}
		/>
	);
}
