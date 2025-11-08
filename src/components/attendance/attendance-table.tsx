import type { FieldApi } from "@tanstack/react-form";
import { DAY_NAMES, formatDate, isWeekend } from "@/utils/date";
import {
	DAILY_ATTENDANCE_OPTIONS,
	getEmploymentTypeShort,
} from "@/utils/attendance";

interface AttendanceTableProps {
	employees: Array<{
		id: string;
		firstName: string;
		lastName: string;
		employmentType: string;
	}>;
	weekDates: Date[];
	getField: (fieldName: string) => FieldApi<any, any, any, any>;
}

export function AttendanceTable({
	employees,
	weekDates,
	getField,
}: AttendanceTableProps) {
	if (employees.length === 0) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
				<p className="text-gray-500">No hay empleados activos</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 sticky top-0 z-10">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 border-r border-gray-200 min-w-[150px]">
								Empleado
							</th>
							<th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 border-r border-gray-200">
								Tipo
							</th>
							{weekDates.map((date, index) => {
								const isWeekendDay = isWeekend(date);
								return (
									<th
										key={date.toISOString()}
										className={`px-4 py-3 text-center text-xs font-semibold min-w-[120px] ${
											isWeekendDay ? "bg-gray-100" : ""
										}`}
									>
										<div className="font-semibold text-gray-900">
											{DAY_NAMES[index]}
										</div>
										<div className="text-gray-500 font-normal text-xs mt-0.5">
											{date.getDate()}/{date.getMonth() + 1}
										</div>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{employees.map((employee) => (
							<tr
								key={employee.id}
								className="hover:bg-gray-50 transition-colors"
							>
								<td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">
									{employee.firstName} {employee.lastName}
								</td>
								<td className="px-4 py-3 text-center text-xs text-gray-600 border-r border-gray-200">
									{getEmploymentTypeShort(employee.employmentType)}
								</td>
								{weekDates.map((date) => {
									const dateStr = formatDate(date);
									const fieldName = `${employee.id}|${dateStr}`;
									const field = getField(fieldName);
									const isWeekendDay = isWeekend(date);

									return (
										<td
											key={date.toISOString()}
											className={`px-2 py-2 ${isWeekendDay ? "bg-gray-50" : ""}`}
										>
											{employee.employmentType === "HOURLY" ? (
												<input
													type="number"
													step="0.5"
													min="0"
													max="24"
													value={field.state.value || ""}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													className="w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
													placeholder="0"
												/>
											) : employee.employmentType === "DAILY" ? (
												<select
													value={field.state.value || ""}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													className="w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
												>
													{DAILY_ATTENDANCE_OPTIONS.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</select>
											) : (
												<input
													type="number"
													step="0.5"
													min="0"
													value={field.state.value || ""}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													className="w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
													placeholder="0"
												/>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
