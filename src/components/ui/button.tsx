import { Button as AriaButton, type ButtonProps } from "react-aria-components";
import { tv } from "tailwind-variants";

const classes = tv({
	base: "rounded-md data-[pressed]:scale-97 transition-transform duration-[0.16s] ease-out-quad flex items-center justify-center",
	variants: {
		size: {
			sm: "px-3 py-1.5 text-sm",
			md: "px-4 py-2 text-base",
			lg: "px-5 py-3 text-lg",
		},
		color: {
			primary:
				"bg-primary text-white data-[hovered]:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed",
			secondary:
				"bg-secondary text-white data-[hovered]:bg-secondary/90 disabled:bg-secondary/40 disabled:cursor-not-allowed",
			ghost:
				"bg-transparent text-gray-800 data-[hovered]:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
			error:
				"bg-error text-white data-[hovered]:bg-error/90 disabled:bg-error/40 disabled:cursor-not-allowed",
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
	color?: "primary" | "secondary" | "ghost" | "error";
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
