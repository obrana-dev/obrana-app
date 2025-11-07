import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface EmployeeFormHeaderProps {
	title: string;
	subtitle?: string;
}

export function EmployeeFormHeader({
	title,
	subtitle,
}: EmployeeFormHeaderProps) {
	return (
		<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="px-4 py-4 sm:px-6">
				<Link
					to="/employees"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
				>
					<ArrowLeft className="w-4 h-4" />
					Volver
				</Link>
				<div>
					<h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
						{title}
					</h1>
					{subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
				</div>
			</div>
		</div>
	);
}
