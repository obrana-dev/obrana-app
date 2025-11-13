import { useCallback, useState } from "react";
import type { PayrollAdjustment } from "@/components/payroll/employee-payroll-card";

/**
 * Custom hook to manage payroll adjustments and row expansion state
 * Encapsulates all adjustment-related logic for the payroll page
 */
export function usePayrollAdjustments() {
	// State to manage adjustments for each employee
	const [employeeAdjustments, setEmployeeAdjustments] = useState<
		Record<string, PayrollAdjustment[]>
	>({});

	// State to manage expanded rows on desktop table
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	/**
	 * Toggle row expansion for desktop table
	 */
	const toggleRowExpansion = useCallback((employeeId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(employeeId)) {
				newSet.delete(employeeId);
			} else {
				newSet.add(employeeId);
			}
			return newSet;
		});
	}, []);

	/**
	 * Add a new adjustment (bonus or deduction) to an employee
	 */
	const addAdjustment = useCallback(
		(employeeId: string, type: "BONUS" | "DEDUCTION") => {
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
		},
		[],
	);

	/**
	 * Remove an adjustment from an employee
	 */
	const removeAdjustment = useCallback(
		(employeeId: string, adjustmentId: string) => {
			setEmployeeAdjustments((prev) => ({
				...prev,
				[employeeId]: (prev[employeeId] || []).filter(
					(adj) => adj.id !== adjustmentId,
				),
			}));
		},
		[],
	);

	/**
	 * Update a field (description or amount) of an adjustment
	 */
	const updateAdjustment = useCallback(
		(
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
		},
		[],
	);

	/**
	 * Calculate net pay for an employee including adjustments
	 */
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

	return {
		// State
		employeeAdjustments,
		expandedRows,
		// Actions
		addAdjustment,
		removeAdjustment,
		updateAdjustment,
		toggleRowExpansion,
		// Computed
		calculateEmployeeNetPay,
	};
}
