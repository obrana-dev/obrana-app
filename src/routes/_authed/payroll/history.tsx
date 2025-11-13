import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PayrollRunCard } from "@/components/payroll/payroll-run-card";
import { PayrollRunDetail } from "@/components/payroll/payroll-run-detail";
import { Button } from "@/components/ui/button";
import { payrollRunsQueryOptions, usePayrollRuns } from "@/queries/payroll";

export const Route = createFileRoute("/_authed/payroll/history")({
	component: PayrollHistory,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(payrollRunsQueryOptions());
	},
});

function PayrollHistory() {
	const { data: payrollRuns, isLoading } = usePayrollRuns();
	const [expandedRun, setExpandedRun] = useState<string | null>(null);

	const toggleRun = (key: string) => {
		setExpandedRun(expandedRun === key ? null : key);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
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
				) : !payrollRuns || payrollRuns.length === 0 ? (
					<EmptyState
						icon={DollarSign}
						title="No hay historial de nóminas"
						description="Los pagos de nómina que proceses aparecerán aquí"
						action={
							<Link to="/payroll">
								<Button>Ir a Pagar Nómina</Button>
							</Link>
						}
					/>
				) : (
					<div className="space-y-3">
						{payrollRuns.map((run) => {
							const key = `${run.payPeriodStart}_${run.payPeriodEnd}_${run.paymentDate}`;
							const isExpanded = expandedRun === key;

							return (
								<div key={key}>
									<PayrollRunCard
										run={run}
										isExpanded={isExpanded}
										onToggle={() => toggleRun(key)}
									/>
									{isExpanded && <PayrollRunDetail employees={run.employees} />}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
