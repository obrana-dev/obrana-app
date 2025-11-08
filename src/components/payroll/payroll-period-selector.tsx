import { Calendar, Clock } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";

interface PayrollPeriodSelectorProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	onSetThisWeek: () => void;
	onSetThisMonth: () => void;
}

export function PayrollPeriodSelector({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	onSetThisWeek,
	onSetThisMonth,
}: PayrollPeriodSelectorProps) {
	const startDateId = useId();
	const endDateId = useId();

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-4">
			<h2 className="text-base font-semibold text-gray-900 mb-3">
				Período de Pago
			</h2>

			{/* Quick Date Buttons */}
			<div className="flex gap-2 mb-4">
				<Button color="ghost" size="sm" onPress={onSetThisWeek} type="button">
					<Clock className="w-4 h-4 mr-2" />
					Esta Semana
				</Button>
				<Button color="ghost" size="sm" onPress={onSetThisMonth} type="button">
					<Calendar className="w-4 h-4 mr-2" />
					Este Mes
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label
						htmlFor={startDateId}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Fecha de Inicio
					</label>
					<input
						id={startDateId}
						type="date"
						value={startDate}
						onChange={(e) => onStartDateChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					/>
				</div>
				<div>
					<label
						htmlFor={endDateId}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Fecha de Fin
					</label>
					<input
						id={endDateId}
						type="date"
						value={endDate}
						onChange={(e) => onEndDateChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					/>
				</div>
			</div>
		</div>
	);
}
