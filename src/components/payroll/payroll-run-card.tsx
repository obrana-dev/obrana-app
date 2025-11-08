import { Calendar, ChevronDown, ChevronUp, Users } from "lucide-react";

interface PayrollRun {
	payPeriodStart: string;
	payPeriodEnd: string;
	paymentDate: string;
	employeeCount: number;
	totalGross: number;
	totalBonuses: number;
	totalDeductions: number;
	totalNet: number;
}

interface PayrollRunCardProps {
	run: PayrollRun;
	isExpanded: boolean;
	onToggle: () => void;
}

// Helper to format date strings (YYYY-MM-DD) to local display
function formatDateString(dateStr: string) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("es-AR");
}

export function PayrollRunCard({
	run,
	isExpanded,
	onToggle,
}: PayrollRunCardProps) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<button
				type="button"
				onClick={onToggle}
				className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
			>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						{/* Header */}
						<div className="flex items-center gap-2 mb-2">
							<Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
							<h3 className="font-semibold text-gray-900">
								{formatDateString(run.payPeriodStart)} -{" "}
								{formatDateString(run.payPeriodEnd)}
							</h3>
						</div>

						{/* Metadata */}
						<div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
							<div className="flex items-center gap-1">
								<Users className="w-4 h-4" />
								<span>{run.employeeCount} empleados</span>
							</div>
							<div>Pagado: {formatDateString(run.paymentDate)}</div>
						</div>

						{/* Summary Grid */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							<div>
								<div className="text-xs text-gray-500">Total Bruto</div>
								<div className="text-sm font-semibold text-gray-900">
									${run.totalGross.toFixed(2)}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Bonos</div>
								<div className="text-sm font-semibold text-green-600">
									+${run.totalBonuses.toFixed(2)}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Deducciones</div>
								<div className="text-sm font-semibold text-red-600">
									-${run.totalDeductions.toFixed(2)}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Total Neto</div>
								<div className="text-sm font-bold text-primary">
									${run.totalNet.toFixed(2)}
								</div>
							</div>
						</div>
					</div>

					{/* Expand Icon */}
					<div className="flex-shrink-0">
						{isExpanded ? (
							<ChevronUp className="w-5 h-5 text-gray-400" />
						) : (
							<ChevronDown className="w-5 h-5 text-gray-400" />
						)}
					</div>
				</div>
			</button>
		</div>
	);
}
