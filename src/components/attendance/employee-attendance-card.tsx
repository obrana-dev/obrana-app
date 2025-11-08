import { Check, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DAILY_ATTENDANCE_OPTIONS,
	getEmploymentTypeShort,
} from "@/utils/attendance";
import { getInitials } from "@/utils/employee";

interface EmployeeAttendanceCardProps {
	employee: {
		id: string;
		firstName: string;
		lastName: string;
		employmentType: string;
	};
	// biome-ignore lint/suspicious/noExplicitAny: React Form Field
	field: any;
}

export function EmployeeAttendanceCard({
	employee,
	field,
}: EmployeeAttendanceCardProps) {
	const value = field.state.value || "";

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start gap-3 mb-3">
				{/* Avatar */}
				<div className="flex-shrink-0">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-sm">
						{getInitials(employee.firstName, employee.lastName)}
					</div>
				</div>

				{/* Employee Info */}
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-gray-900 truncate">
						{employee.firstName} {employee.lastName}
					</h3>
					<p className="text-sm text-gray-500">
						{getEmploymentTypeShort(employee.employmentType)}
					</p>
				</div>
			</div>

			{/* Attendance Input */}
			<div className="space-y-2">
				{employee.employmentType === "HOURLY" ? (
					<div>
						<input
							id={`hours-${employee.id}`}
							type="number"
							step="0.5"
							min="0"
							max="24"
							value={value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							className="w-full px-4 py-2.5 text-lg text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="0"
						/>
					</div>
				) : employee.employmentType === "DAILY" ? (
					<div>
						<div className="grid grid-cols-3 gap-2">
							{DAILY_ATTENDANCE_OPTIONS.map((option) => {
								const isSelected = value === option.value;
								let color: "success" | "warning" | "error" | "ghost" = "ghost";
								let Icon = X;
								let label = "Ausente";

								if (option.value === "1") {
									Icon = Check;
									label = "Completo";
									color = isSelected ? "success" : "ghost";
								} else if (option.value === "0.5") {
									Icon = Minus;
									label = "Medio";
									color = isSelected ? "warning" : "ghost";
								} else {
									Icon = X;
									label = "Ausente";
									color = isSelected ? "error" : "ghost";
								}

								return (
									<Button
										key={option.value}
										type="button"
										onPress={() => field.handleChange(option.value)}
										color={color}
										className={`
											px-2 py-3 rounded-lg text-xs font-semibold transition-all
											border-2 flex flex-col items-center gap-1
											${isSelected ? "scale-105 shadow-md" : ""}
										`}
									>
										<Icon size={18} strokeWidth={2.5} />
										<span>{label}</span>
									</Button>
								);
							})}
						</div>
					</div>
				) : (
					<div>
						<input
							id={`units-${employee.id}`}
							type="number"
							step="0.5"
							min="0"
							value={value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							className="w-full px-4 py-2.5 text-lg text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							placeholder="0"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
