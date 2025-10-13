import { Button as AriaButton, type ButtonProps } from "react-aria-components";

export function Button(props: ButtonProps) {
	return (
		<AriaButton {...props} className="border-amber-600 border-2 p-2 min-w-40" />
	);
}
