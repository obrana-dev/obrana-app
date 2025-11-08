import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/utils/employee";

export interface PayrollAdjustment {
	id: string;
	type: "BONUS" | "DEDUCTION";
	description: string;
	amount: string;
}

interface EmployeePayrollCardProps {
	employee: {
		id: string;
		name: string;
		employmentType: string;
		unitsWorked: number;
		rate: string;
		grossPay: string;
	};
	adjustments: PayrollAdjustment[];
	onAddAdjustment: (type: "BONUS" | "DEDUCTION") => void;
	onRemoveAdjustment: (id: string) => void;
	onUpdateAdjustment: (
		id: string,
		field: "description" | "amount",
		value: string,
	) => void;
}

export function EmployeePayrollCard({
	employee,
	adjustments,
	onAddAdjustment,
	onRemoveAdjustment,
	onUpdateAdjustment,
}: EmployeePayrollCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const totalBonuses = adjustments
		.filter((adj) => adj.type === "BONUS")
		.reduce((sum, adj) => sum + Number.parseFloat(adj.amount || "0"), 0);

	const totalDeductions = adjustments
		.filter((adj) => adj.type === "DEDUCTION")
		.reduce((sum, adj) => sum + Number.parseFloat(adj.amount || "0"), 0);

	const grossPay = Number.parseFloat(employee.grossPay);
	const netPay = grossPay + totalBonuses - totalDeductions;

	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
			{/* Header - Always Visible */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
			>
				{/* Avatar */}
				<div className="flex-shrink-0">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm">
						{getInitials(
							employee.name.split(" ")[0],
							employee.name.split(" ")[1],
						)}
					</div>
				</div>

				{/* Employee Info */}
				<div className="flex-1 min-w-0 text-left">
					<h3 className="font-semibold text-gray-900 truncate">
						{employee.name}
					</h3>
					<p className="text-sm text-gray-500">
						{employee.employmentType === "HOURLY" &&
							`${employee.unitsWorked.toFixed(1)} hs × $${Number.parseFloat(employee.rate).toFixed(2)}`}
						{employee.employmentType === "DAILY" &&
							`${employee.unitsWorked.toFixed(1)} días × $${Number.parseFloat(employee.rate).toFixed(2)}`}
						{employee.employmentType === "SUB_CONTRACTOR" &&
							`${employee.unitsWorked.toFixed(1)} unid. × $${Number.parseFloat(employee.rate).toFixed(2)}`}
					</p>
				</div>

				{/* Net Pay & Expand Icon */}
				<div className="flex items-center gap-2">
					<div className="text-right">
						<div className="text-lg font-bold text-gray-900">
							${netPay.toFixed(2)}
						</div>
						<div className="text-xs text-gray-500">Neto</div>
					</div>
					{isExpanded ? (
						<ChevronUp className="w-5 h-5 text-gray-400" />
					) : (
						<ChevronDown className="w-5 h-5 text-gray-400" />
					)}
				</div>
			</button>

			{/* Expandable Content */}
			{isExpanded && (
				<div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
					{/* Payment Summary */}
					<div className="bg-white rounded-lg p-3 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Pago Bruto</span>
							<span className="font-semibold text-gray-900">
								${grossPay.toFixed(2)}
							</span>
						</div>
						{totalBonuses > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-green-600">Bonos</span>
								<span className="font-semibold text-green-600">
									+${totalBonuses.toFixed(2)}
								</span>
							</div>
						)}
						{totalDeductions > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-red-600">Deducciones</span>
								<span className="font-semibold text-red-600">
									-${totalDeductions.toFixed(2)}
								</span>
							</div>
						)}
						<div className="flex justify-between text-base pt-2 border-t border-gray-200">
							<span className="font-semibold text-gray-900">Pago Neto</span>
							<span className="font-bold text-primary">
								${netPay.toFixed(2)}
							</span>
						</div>
					</div>

					{/* Adjustments Section */}
					<div className="space-y-3">
						<h4 className="font-semibold text-gray-900 text-sm">Ajustes</h4>

						{/* Adjustment Items */}
						{adjustments.map((adjustment) => (
							<div
								key={adjustment.id}
								className="bg-white rounded-md border border-gray-200 overflow-hidden flex"
							>
								<div
									className={`flex items-center justify-center w-8 flex-shrink-0 ${
										adjustment.type === "BONUS"
											? "bg-green-500 text-white"
											: "bg-red-500 text-white"
									}`}
								>
									<span className="text-lg font-bold">
										{adjustment.type === "BONUS" ? "+" : "-"}
									</span>
								</div>
								<div className="flex-1 p-3 space-y-2">
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={adjustment.description}
											onChange={(e) =>
												onUpdateAdjustment(
													adjustment.id,
													"description",
													e.target.value,
												)
											}
											placeholder="Descripción"
											className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
										/>
										<button
											type="button"
											onClick={() => onRemoveAdjustment(adjustment.id)}
											className="text-gray-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
										>
											<Trash2 size={16} />
										</button>
									</div>
									<input
										type="number"
										step="0.01"
										min="0"
										value={adjustment.amount}
										onChange={(e) =>
											onUpdateAdjustment(
												adjustment.id,
												"amount",
												e.target.value,
											)
										}
										placeholder="0.00"
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									/>
								</div>
							</div>
						))}

						{/* Add Adjustment Buttons */}
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								color="success"
								size="sm"
								onPress={() => onAddAdjustment("BONUS")}
								className="flex items-center justify-center gap-1"
							>
								<Plus size={16} />
								Agregar Bono
							</Button>
							<Button
								type="button"
								color="error"
								size="sm"
								onPress={() => onAddAdjustment("DEDUCTION")}
								className="flex items-center justify-center gap-1"
							>
								<Plus size={16} />
								Agregar Deducción
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
