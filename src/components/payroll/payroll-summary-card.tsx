interface PayrollSummaryCardProps {
	employeeCount: number;
	totalGross: number;
	totalNet: number;
}

export function PayrollSummaryCard({
	employeeCount,
	totalGross,
	totalNet,
}: PayrollSummaryCardProps) {
	return (
		<div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 text-white">
			<div className="grid grid-cols-3 gap-4 text-center">
				<div>
					<div className="text-sm opacity-90">Empleados</div>
					<div className="text-2xl font-bold">{employeeCount}</div>
				</div>
				<div>
					<div className="text-sm opacity-90">Total Bruto</div>
					<div className="text-2xl font-bold">${totalGross.toFixed(2)}</div>
				</div>
				<div>
					<div className="text-sm opacity-90">Total Neto</div>
					<div className="text-2xl font-bold">${totalNet.toFixed(2)}</div>
				</div>
			</div>
		</div>
	);
}
