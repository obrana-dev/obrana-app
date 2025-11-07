import { Check, X } from "lucide-react";
import type { FieldApi } from "@tanstack/react-form";
import { getInitials } from "@/utils/employee";
import {
	DAILY_ATTENDANCE_OPTIONS,
	formatAttendanceValue,
	getAttendanceStatus,
	getAttendanceStatusColor,
	getEmploymentTypeShort,
} from "@/utils/attendance";

interface EmployeeAttendanceCardProps {
	employee: {
		id: string;
		firstName: string;
		lastName: string;
		employmentType: string;
	};
	field: FieldApi<any, any, any, any>;
}

export function EmployeeAttendanceCard({
	employee,
	field,
}: EmployeeAttendanceCardProps) {
	const value = field.state.value || "";
	const status = getAttendanceStatus(value);
	const statusColor = getAttendanceStatusColor(status);

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

				{/* Status Badge */}
				{status !== "none" && (
					<div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
						{formatAttendanceValue(value, employee.employmentType)}
					</div>
				)}
			</div>

			{/* Attendance Input */}
			<div className="space-y-2">
				{employee.employmentType === "HOURLY" ? (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">
							Horas trabajadas
						</label>
						<input
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Asistencia
						</label>
						<div className="grid grid-cols-2 gap-2">
							{DAILY_ATTENDANCE_OPTIONS.map((option) => {
								const isSelected = value === option.value;
								const optionStatus = getAttendanceStatus(option.value);

								return (
									<button
										key={option.value}
										type="button"
										onClick={() => field.handleChange(option.value)}
										className={`
											px-4 py-3 rounded-lg text-sm font-medium transition-all
											border-2
											${
												isSelected
													? "border-primary bg-primary text-white shadow-md scale-105"
													: "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
											}
										`}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</div>
				) : (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">
							Unidades trabajadas
						</label>
						<input
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
