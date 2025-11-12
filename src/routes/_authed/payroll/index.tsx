import { createFileRoute, Link } from "@tanstack/react-router";
import { History } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { LoadingState } from "@/components/common/loading-state";
import {
	EmployeePayrollCard,
	type PayrollAdjustment,
} from "@/components/payroll/employee-payroll-card";
import { PayrollDesktopTable } from "@/components/payroll/payroll-desktop-table";
import { PayrollPeriodSelector } from "@/components/payroll/payroll-period-selector";
import { PayrollSummaryCard } from "@/components/payroll/payroll-summary-card";
import { Button } from "@/components/ui/button";
import {
	payrollSummaryQueryOptions,
	usePayrollSummary,
	useSavePayroll,
} from "@/queries/payroll";

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

	// State to manage adjustments for each employee
	const [employeeAdjustments, setEmployeeAdjustments] = useState<
		Record<string, PayrollAdjustment[]>
	>({});

	// State to manage expanded rows on desktop
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

	// Toggle row expansion for desktop table
	const toggleRowExpansion = (employeeId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(employeeId)) {
				newSet.delete(employeeId);
			} else {
				newSet.add(employeeId);
			}
			return newSet;
		});
	};

	// Add adjustment to an employee
	const handleAddAdjustment = (
		employeeId: string,
		type: "BONUS" | "DEDUCTION",
	) => {
		const newAdjustment: PayrollAdjustment = {
			id: crypto.randomUUID(),
			type,
			description: "",
			amount: "",
		};

		setEmployeeAdjustments((prev) => ({
			...prev,
			[employeeId]: [...(prev[employeeId] || []), newAdjustment],
		}));
	};

	// Remove adjustment from an employee
	const handleRemoveAdjustment = (employeeId: string, adjustmentId: string) => {
		setEmployeeAdjustments((prev) => ({
			...prev,
			[employeeId]: (prev[employeeId] || []).filter(
				(adj) => adj.id !== adjustmentId,
			),
		}));
	};

	// Update adjustment field
	const handleUpdateAdjustment = (
		employeeId: string,
		adjustmentId: string,
		field: "description" | "amount",
		value: string,
	) => {
		setEmployeeAdjustments((prev) => ({
			...prev,
			[employeeId]: (prev[employeeId] || []).map((adj) =>
				adj.id === adjustmentId ? { ...adj, [field]: value } : adj,
			),
		}));
	};

	// Calculate net pay for an employee including adjustments
	const calculateEmployeeNetPay = useCallback(
		(employeeId: string, grossPay: string) => {
			const adjustments = employeeAdjustments[employeeId] || [];
			const gross = Number.parseFloat(grossPay);

			// Validate parsed number to prevent NaN calculations
			if (Number.isNaN(gross)) {
				console.warn(
					`Invalid grossPay value: ${grossPay} for employee ${employeeId}`,
				);
				return 0;
			}

			const bonuses = adjustments
				.filter((adj) => adj.type === "BONUS")
				.reduce((sum, adj) => sum + Number.parseFloat(adj.amount || "0"), 0);
			const deductions = adjustments
				.filter((adj) => adj.type === "DEDUCTION")
				.reduce((sum, adj) => sum + Number.parseFloat(adj.amount || "0"), 0);
			return gross + bonuses - deductions;
		},
		[employeeAdjustments],
	);

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
									handleAddAdjustment(employee.employeeId, type)
								}
								onRemoveAdjustment={(id) =>
									handleRemoveAdjustment(employee.employeeId, id)
								}
								onUpdateAdjustment={(id, field, value) =>
									handleUpdateAdjustment(employee.employeeId, id, field, value)
								}
							/>
						))
					) : (
						<div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
							No hay empleados activos con asistencia en este período
						</div>
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
						onAddAdjustment={handleAddAdjustment}
						onUpdateAdjustment={handleUpdateAdjustment}
						onRemoveAdjustment={handleRemoveAdjustment}
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
