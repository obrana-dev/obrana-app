import {
	TextField as AriaTextField,
	TextArea,
	type TextAreaProps,
	type TextFieldProps,
} from "react-aria-components";
import { Label } from "./label";
import { Text } from "./text";

export function TextAreaField({
	label,
	description,
	TextAreaProps,
	...props
}: TextFieldProps & {
	label: string;
	description?: string;
	TextAreaProps: TextAreaProps;
}) {
	return (
		<AriaTextField {...props}>
			<Label>{label}</Label>
			<TextArea className="border-blue-500 border-2" />
			<Text slot="description">{description}</Text>
		</AriaTextField>
	);
}
