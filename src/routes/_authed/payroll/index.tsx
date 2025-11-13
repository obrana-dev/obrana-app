import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingState } from "@/components/common/loading-state";
import { EmployeePayrollCard } from "@/components/payroll/employee-payroll-card";
import { PayrollDesktopTable } from "@/components/payroll/payroll-desktop-table";
import { PayrollPeriodSelector } from "@/components/payroll/payroll-period-selector";
import { PayrollSummaryCard } from "@/components/payroll/payroll-summary-card";
import { Button } from "@/components/ui/button";
import { usePayrollAdjustments } from "@/hooks/usePayrollAdjustments";
import {
	payrollSummaryQueryOptions,
	usePayrollSummary,
	useSavePayroll,
} from "@/queries/payroll";
import {
	formatDate,
	getMonthEnd,
	getMonthStart,
	getWeekEnd,
	getWeekStart,
} from "@/utils/date";

export const Route = createFileRoute("/_authed/payroll/")({
	component: RunPayroll,
	loader: async ({ context }) => {
		// Pre-fetch current week's payroll
		const today = new Date();
		const defaultWeekStart = getWeekStart(today);
		const defaultWeekEnd = getWeekEnd(defaultWeekStart);
		const startDate = formatDate(defaultWeekStart);
		const endDate = formatDate(defaultWeekEnd);

		await context.queryClient.ensureQueryData(
			payrollSummaryQueryOptions(startDate, endDate),
		);
	},
});

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

	// Payroll adjustments hook
	const {
		employeeAdjustments,
		expandedRows,
		addAdjustment,
		removeAdjustment,
		updateAdjustment,
		toggleRowExpansion,
		calculateEmployeeNetPay,
	} = usePayrollAdjustments();

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

	// Save payroll handler
	const handleSavePayroll = () => {
		if (!payrollData) return;

		const records = payrollData.map((emp) => {
			const adjustments = employeeAdjustments[emp.employeeId] || [];
			const netPay = calculateEmployeeNetPay(emp.employeeId, emp.grossPay);

			return {
				employeeId: emp.employeeId,
				employeeName: emp.employeeName,
				grossPay: emp.grossPay,
				adjustments: adjustments.map((adj) => ({
					type: adj.type,
					description: adj.description,
					amount: adj.amount,
				})),
				netPay: netPay.toFixed(2),
			};
		});

		savePayroll.mutate({
			data: {
				payPeriodStart: startDate,
				payPeriodEnd: endDate,
				records,
			},
		});
	};

	// Memoize totals to prevent unnecessary recalculations
	const { totalGross, totalNet } = useMemo(() => {
		if (!payrollData) return { totalGross: 0, totalNet: 0 };

		const gross = payrollData.reduce(
			(sum, emp) => sum + Number.parseFloat(emp.grossPay),
			0,
		);

		const net = payrollData.reduce(
			(sum, emp) => sum + calculateEmployeeNetPay(emp.employeeId, emp.grossPay),
			0,
		);

		return { totalGross: gross, totalNet: net };
	}, [payrollData, calculateEmployeeNetPay]);

	if (isLoading) {
		return <LoadingState message="Cargando nómina..." />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Pagar Nómina</h1>
					<Link to="/payroll/history">
						<Button color="ghost" size="sm">
							<History className="w-4 h-4 md:mr-2" />
							<span className="hidden md:inline">Ver Historial</span>
						</Button>
					</Link>
				</div>
			</div>

			{/* Date Range Selection */}
			<div className="px-4 md:px-6 py-4 space-y-4 max-w-7xl mx-auto">
				<PayrollPeriodSelector
					startDate={startDate}
					endDate={endDate}
					onStartDateChange={setStartDate}
					onEndDateChange={setEndDate}
					onSetThisWeek={setThisWeek}
					onSetThisMonth={setThisMonth}
				/>

				{/* Summary Card */}
				{payrollData && payrollData.length > 0 && (
					<PayrollSummaryCard
						employeeCount={payrollData.length}
						totalGross={totalGross}
						totalNet={totalNet}
					/>
				)}

				{/* Mobile: Employee Cards */}
				<div className="md:hidden space-y-3">
					{payrollData && payrollData.length > 0 ? (
						payrollData.map((employee) => (
							<EmployeePayrollCard
								key={employee.employeeId}
								employee={{
									id: employee.employeeId,
									name: employee.employeeName,
									employmentType: employee.employmentType,
									unitsWorked: employee.unitsWorked,
									rate: employee.rate,
									grossPay: employee.grossPay,
								}}
								adjustments={employeeAdjustments[employee.employeeId] || []}
								onAddAdjustment={(type) =>
									addAdjustment(employee.employeeId, type)
								}
								onRemoveAdjustment={(id) =>
									removeAdjustment(employee.employeeId, id)
								}
								onUpdateAdjustment={(id, field, value) =>
									updateAdjustment(employee.employeeId, id, field, value)
								}
							/>
						))
					) : (
						<EmptyState
							icon={Users}
							title="No hay empleados activos con asistencia"
							description="No hay registros de asistencia para el período seleccionado"
							action={
								<Link to="/employees/new">
									<Button>
										<Plus className="w-4 h-4 mr-2" />
										Agregar Empleado
									</Button>
								</Link>
							}
						/>
					)}
				</div>

				{/* Desktop: Table with Expandable Rows */}
				<div className="hidden md:block">
					<PayrollDesktopTable
						employees={payrollData || []}
						employeeAdjustments={employeeAdjustments}
						expandedRows={expandedRows}
						totalGross={totalGross}
						totalNet={totalNet}
						calculateEmployeeNetPay={calculateEmployeeNetPay}
						onToggleExpansion={toggleRowExpansion}
						onAddAdjustment={addAdjustment}
						onUpdateAdjustment={updateAdjustment}
						onRemoveAdjustment={removeAdjustment}
					/>
				</div>
			</div>

			{/* Sticky Save Button */}
			{payrollData && payrollData.length > 0 && (
				<>
					{/* Mobile Save Button */}
					<div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
						<Button
							type="button"
							color="primary"
							size="lg"
							onPress={handleSavePayroll}
							isDisabled={savePayroll.isPending}
							className="w-full"
						>
							{savePayroll.isPending ? "Guardando..." : "Guardar Nómina"}
						</Button>
					</div>

					{/* Desktop Save Button */}
					<div className="hidden md:block sticky bottom-0 left-0 right-0 border-t border-gray-200 p-4">
						<div className="max-w-7xl mx-auto flex justify-end">
							<Button
								type="button"
								color="primary"
								size="lg"
								onPress={handleSavePayroll}
								isDisabled={savePayroll.isPending}
								className="min-w-[200px]"
							>
								{savePayroll.isPending ? "Guardando..." : "Guardar Nómina"}
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
