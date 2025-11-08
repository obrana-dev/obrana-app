import type { PayrollAdjustment } from "./employee-payroll-card";
import { PayrollDesktopRow } from "./payroll-desktop-row";

interface PayrollEmployee {
	employeeId: string;
	employeeName: string;
	employmentType: string;
	unitsWorked: number;
	rate: string;
	grossPay: string;
}

interface PayrollDesktopTableProps {
	employees: PayrollEmployee[];
	employeeAdjustments: Record<string, PayrollAdjustment[]>;
	expandedRows: Set<string>;
	totalGross: number;
	totalNet: number;
	calculateEmployeeNetPay: (employeeId: string, grossPay: string) => number;
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

export function PayrollDesktopTable({
	employees,
	employeeAdjustments,
	expandedRows,
	totalGross,
	totalNet,
	calculateEmployeeNetPay,
	onToggleExpansion,
	onAddAdjustment,
	onUpdateAdjustment,
	onRemoveAdjustment,
}: PayrollDesktopTableProps) {
	if (!employees || employees.length === 0) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
				No hay empleados activos con asistencia en este período
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-8" />
							<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
								Empleado
							</th>
							<th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								Tipo
							</th>
							<th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
								Unidades
							</th>
							<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
								Tarifa
							</th>
							<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
								Pago Bruto
							</th>
							<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
								Ajustes
							</th>
							<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
								Pago Neto
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{employees.map((employee) => {
							const adjustments =
								employeeAdjustments[employee.employeeId] || [];
							const isExpanded = expandedRows.has(employee.employeeId);
							const netPay = calculateEmployeeNetPay(
								employee.employeeId,
								employee.grossPay,
							);
							const totalBonuses = adjustments
								.filter((adj) => adj.type === "BONUS")
								.reduce(
									(sum, adj) => sum + Number.parseFloat(adj.amount || "0"),
									0,
								);
							const totalDeductions = adjustments
								.filter((adj) => adj.type === "DEDUCTION")
								.reduce(
									(sum, adj) => sum + Number.parseFloat(adj.amount || "0"),
									0,
								);

							return (
								<PayrollDesktopRow
									key={employee.employeeId}
									employee={employee}
									adjustments={adjustments}
									isExpanded={isExpanded}
									netPay={netPay}
									totalBonuses={totalBonuses}
									totalDeductions={totalDeductions}
									onToggleExpansion={onToggleExpansion}
									onAddAdjustment={onAddAdjustment}
									onUpdateAdjustment={onUpdateAdjustment}
									onRemoveAdjustment={onRemoveAdjustment}
								/>
							);
						})}
					</tbody>
					<tfoot className="bg-gray-50 border-t-2 border-gray-300">
						<tr>
							<td
								colSpan={5}
								className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
							>
								Totales:
							</td>
							<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
								${totalGross.toFixed(2)}
							</td>
							<td className="px-4 py-3 text-right text-sm text-gray-600">-</td>
							<td className="px-4 py-3 text-right text-sm font-bold text-primary">
								${totalNet.toFixed(2)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
