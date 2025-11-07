import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	payrollHistoryQueryOptions,
	usePayrollHistory,
} from "@/queries/payroll";

export const Route = createFileRoute("/_authed/payroll/history")({
	component: PayrollHistory,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(payrollHistoryQueryOptions());
	},
});

// Helper to format date strings (YYYY-MM-DD) to local display without timezone issues
function formatDateString(dateStr: string) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString("es-AR");
}

function PayrollHistory() {
	const { data: payrollHistory, isLoading } = usePayrollHistory();

	return (
		<div className="p-6">
			<div className="mb-6">
				<Link
					to="/payroll"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="w-4 h-4" />
					Volver a Nómina
				</Link>
				<h1 className="text-2xl font-semibold text-gray-900">
					Historial de Nóminas
				</h1>
			</div>

			{isLoading ? (
				<div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
					Cargando historial...
				</div>
			) : !payrollHistory || payrollHistory.length === 0 ? (
				<div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
					No hay historial de nóminas
				</div>
			) : (
				<div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
									Fecha de Pago
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
									Período
								</th>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
									Empleado
								</th>
								<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
									Pago Bruto
								</th>
								<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
									Bonos
								</th>
								<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
									Deducciones
								</th>
								<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
									Pago Neto
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{payrollHistory.map((record) => (
								<tr key={record.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm text-gray-900">
										{formatDateString(record.paymentDate)}
									</td>
									<td className="px-4 py-3 text-sm text-gray-600">
										{formatDateString(record.payPeriodStart)} -{" "}
										{formatDateString(record.payPeriodEnd)}
									</td>
									<td className="px-4 py-3 text-sm font-medium text-gray-900">
										{record.employeeName}
									</td>
									<td className="px-4 py-3 text-sm text-right text-gray-900">
										${Number.parseFloat(record.grossPay).toFixed(2)}
									</td>
									<td className="px-4 py-3 text-sm text-right text-gray-600">
										${Number.parseFloat(record.bonuses || "0").toFixed(2)}
									</td>
									<td className="px-4 py-3 text-sm text-right text-gray-600">
										${Number.parseFloat(record.deductions || "0").toFixed(2)}
									</td>
									<td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
										${Number.parseFloat(record.netPay).toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
