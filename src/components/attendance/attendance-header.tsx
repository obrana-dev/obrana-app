import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/utils/date";

interface AttendanceHeaderProps {
	weekDates: Date[];
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onCurrentWeek: () => void;
}

export function AttendanceHeader({
	weekDates,
	onPreviousWeek,
	onNextWeek,
	onCurrentWeek,
}: AttendanceHeaderProps) {
	return (
		<div className="bg-white border-b border-gray-200 sticky top-0 z-20">
			<div className="px-4 py-4 sm:px-6">
				<div className="flex items-center justify-between mb-3">
					<h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Asistencia Semanal
					</h1>
					<div className="flex items-center gap-1 sm:gap-2">
						<Button
							size="sm"
							color="ghost"
							onPress={onPreviousWeek}
							className="p-2"
							aria-label="Semana anterior"
						>
							<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
						<Button
							size="sm"
							color="ghost"
							onPress={onCurrentWeek}
							className="hidden sm:flex"
						>
							Semana Actual
						</Button>
						<Button
							size="sm"
							color="ghost"
							onPress={onNextWeek}
							className="p-2"
							aria-label="Semana siguiente"
						>
							<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
					</div>
				</div>
				<p className="text-sm text-gray-600">
					{formatDateRange(weekDates[0], weekDates[6])}
				</p>
			</div>
		</div>
	);
}
