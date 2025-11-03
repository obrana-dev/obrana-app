import { createFormHook } from "@tanstack/react-form";

import {
	SelectField,
	SubscribeButton,
	TextAreaField,
	TextField,
} from "../components/ui/form-components";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		SelectField,
		TextAreaField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
