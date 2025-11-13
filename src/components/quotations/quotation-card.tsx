import { Link } from "@tanstack/react-router";
import { Building2, Calendar, FileText } from "lucide-react";
import { memo } from "react";
import type { Quotation } from "@/db/schema";
import { formatCurrency, getQuotationStatusInfo } from "@/utils/quotation";

interface QuotationCardProps {
	quotation: Quotation & {
		client: { id: string; name: string } | null;
	};
}

export const QuotationCard = memo(function QuotationCard({ quotation }: QuotationCardProps) {
	const statusInfo = getQuotationStatusInfo(quotation.status);

	return (
		<Link
			to="/quotations/$quotationId"
			params={{ quotationId: quotation.id }}
			className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
		>
			<div className="p-4 sm:p-6">
				<div className="flex items-start justify-between gap-3 mb-3">
					<div className="flex items-start gap-3 flex-1 min-w-0">
						<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
							<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
								{quotation.quotationNumber}
							</h3>
							{quotation.client && (
								<div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
									<Building2 className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{quotation.client.name}</span>
								</div>
							)}
						</div>
					</div>
					<span
						className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
					>
						{statusInfo.label}
					</span>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2 text-gray-600">
							<Calendar className="w-4 h-4" />
							<span>
								{new Date(quotation.issueDate).toLocaleDateString("es-AR")}
							</span>
						</div>
						<div className="text-right">
							<p className="text-xs text-gray-500">Total</p>
							<p className="text-lg font-semibold text-gray-900">
								{formatCurrency(quotation.total)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
});
