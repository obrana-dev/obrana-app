import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
			<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
				<Icon className="w-8 h-8 text-gray-400" />
			</div>
			<h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
			<p className="text-gray-500 mb-6">{description}</p>
			{action && <div>{action}</div>}
		</div>
	);
}
