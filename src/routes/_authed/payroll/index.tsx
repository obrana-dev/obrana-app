import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, History } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import { usePayrollSummary, useSavePayroll } from "@/queries/payroll";

export const Route = createFileRoute("/_authed/payroll/")({
	component: RunPayroll,
});

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
	return date.toISOString().split("T")[0];
}

// Get the start of the week (Monday)
function getWeekStart(date: Date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff));
}

// Get the end of the week (Sunday)
function getWeekEnd(weekStart: Date) {
	const d = new Date(weekStart);
	d.setDate(d.getDate() + 6);
	return d;
}

// Get the start of the month
function getMonthStart(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Get the end of the month
function getMonthEnd(date: Date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function RunPayroll() {
	const today = new Date();
	const defaultWeekStart = getWeekStart(today);
	const defaultWeekEnd = getWeekEnd(defaultWeekStart);

	const [startDate, setStartDate] = useState(formatDate(defaultWeekStart));
	const [endDate, setEndDate] = useState(formatDate(defaultWeekEnd));

	const { data: payrollData, isLoading } = usePayrollSummary(
		startDate,
		endDate,
	);
	const savePayroll = useSavePayroll();

	// Quick date selection handlers
	const setThisWeek = () => {
		const weekStart = getWeekStart(new Date());
		const weekEnd = getWeekEnd(weekStart);
		setStartDate(formatDate(weekStart));
		setEndDate(formatDate(weekEnd));
	};

	const setThisMonth = () => {
		const monthStart = getMonthStart(new Date());
		const monthEnd = getMonthEnd(new Date());
		setStartDate(formatDate(monthStart));
		setEndDate(formatDate(monthEnd));
	};

	// Create form schema dynamically based on payroll data
	const payrollFormSchema = z.object({
		startDate: z.string().min(1, "Fecha de inicio requerida"),
		endDate: z.string().min(1, "Fecha de fin requerida"),
		adjustments: z.record(
			z.string(),
			z.object({
				bonuses: z.string().optional(),
				deductions: z.string().optional(),
			}),
		),
	});

	const form = useAppForm({
		defaultValues: {
			startDate,
			endDate,
			adjustments: {} as Record<
				string,
				{ bonuses?: string; deductions?: string }
			>,
		},
		onSubmit: async (data) => {
			if (!payrollData || payrollData.length === 0) {
				return;
			}

			const records = payrollData.map((employee) => {
				const adjustment = data.value.adjustments[employee.employeeId] || {};
				const bonuses = Number.parseFloat(adjustment.bonuses || "0");
				const deductions = Number.parseFloat(adjustment.deductions || "0");
				const gross = Number.parseFloat(employee.grossPay);
				const netPay = (gross + bonuses - deductions).toFixed(2);

				return {
					employeeId: employee.employeeId,
					employeeName: employee.employeeName,
					grossPay: employee.grossPay,
					bonuses: adjustment.bonuses || "0",
					deductions: adjustment.deductions || "0",
					netPay,
				};
			});

			savePayroll.mutate({
				data: {
					payPeriodStart: data.value.startDate,
					payPeriodEnd: data.value.endDate,
					records,
				},
			});
		},
		validators: {
			onChange: payrollFormSchema,
		},
	});

	// Update external state when form dates change
	useEffect(() => {
		const subscription = form.store.subscribe(() => {
			const state = form.store.state;
			if (state.values.startDate !== startDate) {
				setStartDate(state.values.startDate);
			}
			if (state.values.endDate !== endDate) {
				setEndDate(state.values.endDate);
			}
		});
		return () => subscription();
	}, [form.store, startDate, endDate]);

	// Calculate net pay for an employee
	const calculateNetPay = (employeeId: string, grossPay: string) => {
		const adjustments = form.store.state.values.adjustments[employeeId] || {};
		const bonuses = Number.parseFloat(adjustments.bonuses || "0");
		const deductions = Number.parseFloat(adjustments.deductions || "0");
		const gross = Number.parseFloat(grossPay);
		return (gross + bonuses - deductions).toFixed(2);
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<p>Cargando nómina...</p>
			</div>
		);
	}

	const adjustments = form.store.state.values.adjustments;
	const totalGrossPay = payrollData?.reduce(
		(sum, emp) => sum + Number.parseFloat(emp.grossPay),
		0,
	);
	const totalBonuses = payrollData?.reduce(
		(sum, emp) =>
			sum + Number.parseFloat(adjustments[emp.employeeId]?.bonuses || "0"),
		0,
	);
	const totalDeductions = payrollData?.reduce(
		(sum, emp) =>
			sum + Number.parseFloat(adjustments[emp.employeeId]?.deductions || "0"),
		0,
	);
	const totalNetPay =
		(totalGrossPay || 0) + (totalBonuses || 0) - (totalDeductions || 0);

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-gray-900">Pagar Nómina</h1>
				<Link to="/payroll/history">
					<Button color="ghost" size="sm">
						<History className="w-4 h-4 mr-2" />
						Ver Historial
					</Button>
				</Link>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* Date Range Selection */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Período de Pago
					</h2>

					{/* Quick Date Buttons */}
					<div className="flex gap-2 mb-4">
						<Button color="ghost" size="sm" onPress={setThisWeek} type="button">
							<Clock className="w-4 h-4 mr-2" />
							Esta Semana
						</Button>
						<Button
							color="ghost"
							size="sm"
							onPress={setThisMonth}
							type="button"
						>
							<Calendar className="w-4 h-4 mr-2" />
							Este Mes
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.AppField name="startDate">
							{(field) => (
								<field.TextField label="Fecha de Inicio" type="date" />
							)}
						</form.AppField>
						<form.AppField name="endDate">
							{(field) => <field.TextField label="Fecha de Fin" type="date" />}
						</form.AppField>
					</div>
				</div>

				{/* Payroll Summary Table */}
				<div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-6">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
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
							{payrollData?.map((employee) => (
								<tr key={employee.employeeId} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm font-medium text-gray-900">
										{employee.employeeName}
									</td>
									<td className="px-4 py-3 text-center text-xs text-gray-600">
										{employee.employmentType === "HOURLY" && "Hora"}
										{employee.employmentType === "DAILY" && "Día"}
										{employee.employmentType === "SUB_CONTRACTOR" && "Sub"}
									</td>
									<td className="px-4 py-3 text-center text-sm text-gray-900">
										{Number.parseFloat(employee.unitsWorked.toString()).toFixed(
											1,
										)}{" "}
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
									<td className="px-4 py-3 text-right">
										<form.AppField
											name={`adjustments.${employee.employeeId}.bonuses`}
										>
											{(field) => (
												<input
													type="number"
													step="0.01"
													min="0"
													value={field.state.value || ""}
													onChange={(e) => field.handleChange(e.target.value)}
													className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
													placeholder="0.00"
												/>
											)}
										</form.AppField>
									</td>
									<td className="px-4 py-3 text-right">
										<form.AppField
											name={`adjustments.${employee.employeeId}.deductions`}
										>
											{(field) => (
												<input
													type="number"
													step="0.01"
													min="0"
													value={field.state.value || ""}
													onChange={(e) => field.handleChange(e.target.value)}
													className="w-28 text-right px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
													placeholder="0.00"
												/>
											)}
										</form.AppField>
									</td>
									<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
										${calculateNetPay(employee.employeeId, employee.grossPay)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot className="bg-gray-50 border-t-2 border-gray-300">
							<tr>
								<td
									colSpan={4}
									className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
								>
									Totales:
								</td>
								<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
									${totalGrossPay?.toFixed(2)}
								</td>
								<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
									${totalBonuses?.toFixed(2)}
								</td>
								<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
									${totalDeductions?.toFixed(2)}
								</td>
								<td className="px-4 py-3 text-right text-sm font-bold text-primary">
									${totalNetPay?.toFixed(2)}
								</td>
							</tr>
						</tfoot>
					</table>

					{payrollData?.length === 0 && (
						<div className="p-8 text-center text-gray-500">
							No hay empleados activos con asistencia en este período
						</div>
					)}
				</div>

				{/* Save Button */}
				{payrollData && payrollData.length > 0 && (
					<div className="flex justify-end">
						<form.AppForm>
							<form.SubscribeButton
								label={
									savePayroll.isPending ? "Guardando..." : "Guardar Nómina"
								}
							/>
						</form.AppForm>
					</div>
				)}
			</form>
		</div>
	);
}
