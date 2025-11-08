import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PayrollAdjustment } from "./employee-payroll-card";

interface PayrollEmployee {
	employeeId: string;
	employeeName: string;
	employmentType: string;
	unitsWorked: number;
	rate: string;
	grossPay: string;
}

interface PayrollDesktopRowProps {
	employee: PayrollEmployee;
	adjustments: PayrollAdjustment[];
	isExpanded: boolean;
	netPay: number;
	totalBonuses: number;
	totalDeductions: number;
	onToggleExpansion: (employeeId: string) => void;
	onAddAdjustment: (employeeId: string, type: "BONUS" | "DEDUCTION") => void;
	onUpdateAdjustment: (
		employeeId: string,
		adjustmentId: string,
		field: "description" | "amount",
		value: string,
	) => void;
	onRemoveAdjustment: (employeeId: string, adjustmentId: string) => void;
}

export function PayrollDesktopRow({
	employee,
	adjustments,
	isExpanded,
	netPay,
	totalBonuses,
	totalDeductions,
	onToggleExpansion,
	onAddAdjustment,
	onUpdateAdjustment,
	onRemoveAdjustment,
}: PayrollDesktopRowProps) {
	return (
		<>
			<tr
				key={employee.employeeId}
				onClick={() => onToggleExpansion(employee.employeeId)}
				className="hover:bg-gray-50 cursor-pointer"
			>
				<td className="px-4 py-3">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onToggleExpansion(employee.employeeId);
						}}
						className="text-gray-400 hover:text-primary transition-colors"
					>
						{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
					</button>
				</td>
				<td className="px-4 py-3 text-sm font-medium text-gray-900">
					{employee.employeeName}
				</td>
				<td className="px-4 py-3 text-center text-xs text-gray-600">
					{employee.employmentType === "HOURLY" && "Hora"}
					{employee.employmentType === "DAILY" && "Día"}
					{employee.employmentType === "SUB_CONTRACTOR" && "Sub"}
				</td>
				<td className="px-4 py-3 text-center text-sm text-gray-900">
					{employee.unitsWorked.toFixed(1)}{" "}
					{employee.employmentType === "HOURLY" && "hs"}
					{employee.employmentType === "DAILY" && "días"}
					{employee.employmentType === "SUB_CONTRACTOR" && "unid."}
				</td>
				<td className="px-4 py-3 text-right text-sm text-gray-900">
					${Number.parseFloat(employee.rate).toFixed(2)}
				</td>
				<td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
					${Number.parseFloat(employee.grossPay).toFixed(2)}
				</td>
				<td className="px-4 py-3 text-right text-sm text-gray-600">
					{totalBonuses > 0 && (
						<span className="text-green-600">+${totalBonuses.toFixed(2)}</span>
					)}
					{totalBonuses > 0 && totalDeductions > 0 && " / "}
					{totalDeductions > 0 && (
						<span className="text-red-600">-${totalDeductions.toFixed(2)}</span>
					)}
					{totalBonuses === 0 && totalDeductions === 0 && "-"}
				</td>
				<td className="px-4 py-3 text-right text-sm font-bold text-primary">
					${netPay.toFixed(2)}
				</td>
			</tr>
			{isExpanded && (
				<tr>
					<td colSpan={8} className="px-4 py-4 bg-gray-50">
						<div className="space-y-3">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold text-gray-900 text-sm">
									Ajustes para {employee.employeeName}
								</h4>
								<div className="flex gap-2">
									<Button
										type="button"
										color="success"
										size="sm"
										onPress={() =>
											onAddAdjustment(employee.employeeId, "BONUS")
										}
									>
										<Plus size={16} className="mr-1" />
										Bono
									</Button>
									<Button
										type="button"
										color="error"
										size="sm"
										onPress={() =>
											onAddAdjustment(employee.employeeId, "DEDUCTION")
										}
									>
										<Plus size={16} className="mr-1" />
										Deducción
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3">
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
										<div className="flex-1 flex items-center gap-3 p-3">
											<input
												type="text"
												value={adjustment.description}
												onChange={(e) =>
													onUpdateAdjustment(
														employee.employeeId,
														adjustment.id,
														"description",
														e.target.value,
													)
												}
												placeholder="Descripción"
												className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
											/>
											<input
												type="number"
												step="0.01"
												min="0"
												value={adjustment.amount}
												onChange={(e) =>
													onUpdateAdjustment(
														employee.employeeId,
														adjustment.id,
														"amount",
														e.target.value,
													)
												}
												placeholder="0.00"
												className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
											/>
											<button
												type="button"
												onClick={() =>
													onRemoveAdjustment(employee.employeeId, adjustment.id)
												}
												className="text-gray-400 hover:text-red-500 transition-colors p-2"
											>
												<Trash2 size={18} />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</td>
				</tr>
			)}
		</>
	);
}
