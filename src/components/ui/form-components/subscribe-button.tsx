import { Button } from "@/components/ui";
import { useFormContext } from "@/hooks/form-context";

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					color="secondary"
					isDisabled={isSubmitting}
					isPending={isSubmitting}
				>
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
}
