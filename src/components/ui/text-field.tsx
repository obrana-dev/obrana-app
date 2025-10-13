import {
	TextField as AriaTextField,
	Input,
	type TextFieldProps,
} from "react-aria-components";
import { Label } from "./label";
import { Text } from "./text";

export function TextField({
	label,
	description,
	...props
}: TextFieldProps & { label: string; description?: string }) {
	return (
		<AriaTextField {...props} className="w-full flex flex-col">
			<Label className="mb-1">{label}</Label>
			<Input className="border-blue-500 border-2" />
			<Text slot="description" className="mt-1">{description}</Text>
		</AriaTextField>
	);
}
