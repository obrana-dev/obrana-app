interface ErrorsObject {
	[key: string]: { errors: Array<{ message: string }> };
}

const formatErrors = (errors: ErrorsObject) => {
	if (!errors) return undefined;
	if (typeof errors === "string") return errors;
	if (Array.isArray(errors) && errors.length > 0)
		return errors
			.map((e) => (typeof e === "string" ? e : e.message))
			.join(", ");
	return undefined;
};

export { formatErrors, type ErrorsObject };
