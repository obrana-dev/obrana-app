import { DAY_NAMES_SHORT, isToday, isWeekend } from "@/utils/date";

interface DaySelectorProps {
	weekDates: Date[];
	selectedDayIndex: number;
	onSelectDay: (index: number) => void;
}

export function DaySelector({
	weekDates,
	selectedDayIndex,
	onSelectDay,
}: DaySelectorProps) {
	return (
		<div className="bg-white border-b border-gray-200 md:hidden">
			<div className="flex px-4 py-3 gap-2">
				{weekDates.map((date, index) => {
					const isSelected = index === selectedDayIndex;
					const isTodayDate = isToday(date);
					const isWeekendDate = isWeekend(date);

					return (
						<button
							key={date.toISOString()}
							type="button"
							onClick={() => onSelectDay(index)}
							className={`
								flex-1 flex flex-col items-center justify-center
								px-2 py-2 rounded-lg transition-all
								${
									isSelected
										? "bg-primary text-white shadow-md scale-105"
										: isWeekendDate
											? "bg-gray-50 text-gray-600 hover:bg-gray-100"
											: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
								}
								${isTodayDate && !isSelected ? "ring-2 ring-primary ring-opacity-50" : ""}
							`}
						>
							<span className="text-xs font-medium mb-1">
								{DAY_NAMES_SHORT[index]}
							</span>
							<span
								className={`text-lg font-bold ${isSelected ? "" : "text-gray-900"}`}
							>
								{date.getDate()}
							</span>
							<span className="text-xs opacity-75">
								{date.getMonth() + 1}/{date.getFullYear().toString().slice(-2)}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
