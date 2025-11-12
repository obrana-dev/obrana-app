import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface QuotationFormHeaderProps {
	title: string;
	subtitle: string;
}

export function QuotationFormHeader({
	title,
	subtitle,
}: QuotationFormHeaderProps) {
	return (
		<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="px-4 py-4 sm:px-6 lg:px-8">
				<Link
					to="/quotations"
					className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Volver a Presupuestos
				</Link>
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
						{title}
					</h1>
					<p className="text-sm text-gray-600 mt-1">{subtitle}</p>
				</div>
			</div>
		</div>
	);
}
