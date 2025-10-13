import { Text } from "@/components/ui";

export function ErrorMessages({
	errors,
}: {
	errors: Array<string | { message: string }>;
}) {
	return (
		<>
			{errors.map((error) => (
				<Text
					key={typeof error === "string" ? error : error.message}
					className="text-red-500 mt-1 text-sm"
				>
					{typeof error === "string" ? error : error.message}
				</Text>
			))}
		</>
	);
}
