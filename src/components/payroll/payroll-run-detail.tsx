interface EmployeePayrollRecord {
	id: string;
	employeeId: string;
	employeeName: string;
	grossPay: string;
	bonuses: string;
	deductions: string;
	netPay: string;
}

interface PayrollRunDetailProps {
	employees: EmployeePayrollRecord[];
}

export function PayrollRunDetail({ employees }: PayrollRunDetailProps) {
	return (
		<div className="border-t border-gray-200 bg-gray-50">
			{/* Mobile: Cards */}
			<div className="md:hidden p-4 space-y-3">
				{employees.map((employee) => (
					<div
						key={employee.id}
						className="bg-white rounded-lg border border-gray-200 p-3"
					>
						<div className="font-semibold text-gray-900 mb-2">
							{employee.employeeName}
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<div className="text-xs text-gray-500">Bruto</div>
								<div className="font-semibold">
									${Number.parseFloat(employee.grossPay).toFixed(2)}
								</div>
							</div>
							<div>
								<div className="text-xs text-gray-500">Neto</div>
								<div className="font-bold text-primary">
									${Number.parseFloat(employee.netPay).toFixed(2)}
								</div>
							</div>
							{Number.parseFloat(employee.bonuses) > 0 && (
								<div>
									<div className="text-xs text-gray-500">Bonos</div>
									<div className="text-green-600">
										+${Number.parseFloat(employee.bonuses).toFixed(2)}
									</div>
								</div>
							)}
							{Number.parseFloat(employee.deductions) > 0 && (
								<div>
									<div className="text-xs text-gray-500">Deducciones</div>
									<div className="text-red-600">
										-${Number.parseFloat(employee.deductions).toFixed(2)}
									</div>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Desktop: Table */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-100 border-b border-gray-200">
						<tr>
							<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
								Empleado
							</th>
							<th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
								Pago Bruto
							</th>
							<th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
								Bonos
							</th>
							<th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
								Deducciones
							</th>
							<th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
								Pago Neto
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{employees.map((employee) => (
							<tr key={employee.id} className="hover:bg-white">
								<td className="px-4 py-2 text-sm text-gray-900">
									{employee.employeeName}
								</td>
								<td className="px-4 py-2 text-sm text-right text-gray-900">
									${Number.parseFloat(employee.grossPay).toFixed(2)}
								</td>
								<td className="px-4 py-2 text-sm text-right text-green-600">
									{Number.parseFloat(employee.bonuses) > 0
										? `+$${Number.parseFloat(employee.bonuses).toFixed(2)}`
										: "-"}
								</td>
								<td className="px-4 py-2 text-sm text-right text-red-600">
									{Number.parseFloat(employee.deductions) > 0
										? `-$${Number.parseFloat(employee.deductions).toFixed(2)}`
										: "-"}
								</td>
								<td className="px-4 py-2 text-sm text-right font-semibold text-primary">
									${Number.parseFloat(employee.netPay).toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
