import { Link } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotationListHeaderProps {
	totalQuotations: number;
}

export function QuotationListHeader({
	totalQuotations,
}: QuotationListHeaderProps) {
	return (
		<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
							<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
						</div>
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
								Presupuestos
							</h1>
							<p className="text-xs sm:text-sm text-gray-600">
								{totalQuotations}{" "}
								{totalQuotations === 1 ? "presupuesto" : "presupuestos"}
							</p>
						</div>
					</div>
					<Link to="/quotations/new">
						<Button className="flex items-center gap-2">
							<Plus className="w-4 h-4" />
							<span className="hidden sm:inline">Nuevo Presupuesto</span>
							<span className="sm:hidden">Nuevo</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
