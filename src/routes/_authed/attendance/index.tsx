import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AttendanceHeader } from "@/components/attendance/attendance-header";
import { DaySelector } from "@/components/attendance/day-selector";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import {
	useBatchSaveAttendance,
	useWeekAttendance,
	weekAttendanceQueryOptions,
} from "@/queries/attendance";
import {
	DAILY_ATTENDANCE_OPTIONS,
	getEmploymentTypeShort,
} from "@/utils/attendance";
import { formatDate, getWeekDates, getWeekStart } from "@/utils/date";
import { getInitials } from "@/utils/employee";

export const Route = createFileRoute("/_authed/attendance/")({
	component: WeeklyAttendance,
	loader: async ({ context }) => {
		// Pre-fetch current week's attendance
		const currentWeekStart = getWeekStart(new Date());
		const weekDates = getWeekDates(currentWeekStart);
		const startDate = formatDate(weekDates[0]);
		const endDate = formatDate(weekDates[6]);

		await context.queryClient.ensureQueryData(
			weekAttendanceQueryOptions(startDate, endDate),
		);
	},
});

function WeeklyAttendance() {
	const [currentWeekStart, setCurrentWeekStart] = useState(
		getWeekStart(new Date()),
	);
	const [selectedDayIndex, setSelectedDayIndex] = useState(
		new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
	);

	const weekDates = getWeekDates(currentWeekStart);
	const startDate = formatDate(weekDates[0]);
	const endDate = formatDate(weekDates[6]);

	const { data: employees, isLoading } = useWeekAttendance(startDate, endDate);

	// Navigate weeks
	const goToPreviousWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(newStart.getDate() - 7);
		setCurrentWeekStart(newStart);
	};

	const goToNextWeek = () => {
		const newStart = new Date(currentWeekStart);
		newStart.setDate(newStart.getDate() + 7);
		setCurrentWeekStart(newStart);
	};

	const goToCurrentWeek = () => {
		setCurrentWeekStart(getWeekStart(new Date()));
		const today = new Date().getDay();
		setSelectedDayIndex(today === 0 ? 6 : today - 1);
	};

	if (isLoading || !employees) {
		return <LoadingState message="Cargando asistencia..." />;
	}

	return (
		<AttendanceForm
			employees={employees}
			weekDates={weekDates}
			selectedDayIndex={selectedDayIndex}
			onSelectDay={setSelectedDayIndex}
			onPreviousWeek={goToPreviousWeek}
			onNextWeek={goToNextWeek}
			onCurrentWeek={goToCurrentWeek}
		/>
	);
}

function AttendanceForm({
	employees,
	weekDates,
	selectedDayIndex,
	onSelectDay,
	onPreviousWeek,
	onNextWeek,
	onCurrentWeek,
}: {
	employees: Array<{
		id: string;
		firstName: string;
		lastName: string;
		employmentType: string;
		attendanceRecords: Array<{
			workDate: string;
			unitsWorked: string;
		}>;
	}>;
	weekDates: Date[];
	selectedDayIndex: number;
	onSelectDay: (index: number) => void;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
	onCurrentWeek: () => void;
}) {
	const batchSave = useBatchSaveAttendance();

	// Build initial values - include ALL employee-date combinations
	const initialValues = useMemo(() => {
		const values: Record<string, string> = {};

		// First, initialize all fields
		// Use "|" as separator since it won't appear in UUIDs or dates
		// Default to "0" (Ausente) for DAILY employees, empty string for others
		employees.forEach((employee) => {
			weekDates.forEach((date) => {
				const dateStr = formatDate(date);
				const key = `${employee.id}|${dateStr}`;
				values[key] = employee.employmentType === "DAILY" ? "0" : "";
			});
		});

		// Then, fill in existing attendance records
		employees.forEach((employee) => {
			employee.attendanceRecords.forEach((record) => {
				const key = `${employee.id}|${record.workDate}`;
				values[key] = record.unitsWorked;
			});
		});

		return values;
	}, [employees, weekDates]);

	// Create form schema - all fields are strings (optional)
	const attendanceSchema = useMemo(() => {
		const shape: Record<string, z.ZodString> = {};
		employees.forEach((employee) => {
			weekDates.forEach((date) => {
				const dateStr = formatDate(date);
				const fieldName = `${employee.id}|${dateStr}`;
				shape[fieldName] = z.string();
			});
		});
		return z.object(shape);
	}, [employees, weekDates]);

	const form = useAppForm({
		defaultValues: initialValues,
		onSubmit: async (formData) => {
			const records = Object.entries(formData.value)
				.filter(([_, value]) => value !== "" && value !== undefined)
				.map(([key, unitsWorked]) => {
					const [employeeId, workDate] = key.split("|");
					return {
						employeeId,
						workDate,
						unitsWorked: unitsWorked || "0",
						status:
							unitsWorked === "0" || unitsWorked === ""
								? ("ABSENT" as const)
								: ("PRESENT" as const),
						projectId: null,
						notes: null,
					};
				});
			if (records.length > 0) {
				batchSave.mutate({ data: { records } });
			}
		},
		validators: {
			onChange: attendanceSchema,
		},
	});

	const selectedDate = weekDates[selectedDayIndex];
	const selectedDateStr = formatDate(selectedDate);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<AttendanceHeader
				weekDates={weekDates}
				onPreviousWeek={onPreviousWeek}
				onNextWeek={onNextWeek}
				onCurrentWeek={onCurrentWeek}
			/>

			<DaySelector
				weekDates={weekDates}
				selectedDayIndex={selectedDayIndex}
				onSelectDay={onSelectDay}
			/>

			<form
				className="flex-1 flex flex-col"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* Mobile: Card View */}
				<div className="md:hidden flex-1 px-4 py-4 space-y-3 pb-24">
					{employees.map((employee) => {
						const fieldName = `${employee.id}|${selectedDateStr}`;
						return (
							<form.Field key={fieldName} name={fieldName}>
								{(field) => {
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
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
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
																let color:
																	| "success"
																	| "warning"
																	| "error"
																	| "ghost" = "ghost";
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
																		onPress={() =>
																			field.handleChange(option.value)
																		}
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
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															onBlur={field.handleBlur}
															className="w-full px-4 py-2.5 text-lg text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
															placeholder="0"
														/>
													</div>
												)}
											</div>
										</div>
									);
								}}
							</form.Field>
						);
					})}
					{employees.length === 0 && (
						<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
							<p className="text-gray-500">No hay empleados activos</p>
						</div>
					)}
				</div>

				{/* Desktop: Enhanced Table View */}
				<div className="hidden md:block flex-1 p-4 pb-0 overflow-auto">
					<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg h-full flex flex-col">
						<div className="overflow-auto flex-1">
							<table className="w-full">
								<thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
									<tr className="border-b-2 border-gray-200">
										<th className="px-6 py-3 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-200 min-w-[200px] shadow-md">
											Empleado
										</th>
										<th className="px-4 py-3 text-center text-xs font-bold text-gray-700 border-r border-gray-200 min-w-[80px]">
											Tipo
										</th>
										{weekDates.map((date, index) => {
											const isWeekendDay =
												date.getDay() === 0 || date.getDay() === 6;
											const isToday =
												date.getDate() === new Date().getDate() &&
												date.getMonth() === new Date().getMonth() &&
												date.getFullYear() === new Date().getFullYear();

											return (
												<th
													key={date.toISOString()}
													className={`px-3 py-3 text-center text-xs font-bold min-w-[140px] ${
														isToday
															? "bg-primary/10 border-x-2 border-primary/30"
															: isWeekendDay
																? "bg-gray-200/50"
																: ""
													}`}
												>
													<div
														className={`font-bold ${isToday ? "text-primary" : "text-gray-900"}`}
													>
														{
															["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][
																index
															]
														}
													</div>
													<div
														className={`font-normal text-xs mt-0.5 ${isToday ? "text-primary/80" : "text-gray-500"}`}
													>
														{date.getDate()}/{date.getMonth() + 1}
													</div>
													{isToday && (
														<div className="text-xs font-semibold text-primary mt-0.5">
															Hoy
														</div>
													)}
												</th>
											);
										})}
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{employees.map((employee, empIndex) => (
										<tr
											key={employee.id}
											className={`hover:bg-gray-50/50 transition-all ${empIndex % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
										>
											<td className="px-6 py-2.5 text-sm font-semibold text-gray-900 sticky left-0 bg-white border-r-2 border-gray-200 shadow-sm">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-bold">
														{employee.firstName[0]}
														{employee.lastName[0]}
													</div>
													<span>
														{employee.firstName} {employee.lastName}
													</span>
												</div>
											</td>
											<td className="px-4 py-2.5 text-center border-r border-gray-200">
												<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
													{employee.employmentType === "HOURLY" && "Hora"}
													{employee.employmentType === "DAILY" && "Día"}
													{employee.employmentType === "SUB_CONTRACTOR" &&
														"Sub"}
												</span>
											</td>
											{weekDates.map((date) => {
												const dateStr = formatDate(date);
												const fieldName = `${employee.id}|${dateStr}`;
												const isWeekendDay =
													date.getDay() === 0 || date.getDay() === 6;
												const isToday =
													date.getDate() === new Date().getDate() &&
													date.getMonth() === new Date().getMonth() &&
													date.getFullYear() === new Date().getFullYear();

												return (
													<td
														key={date.toISOString()}
														className={`px-2 py-2 ${
															isToday
																? "bg-primary/5 border-x-2 border-primary/20"
																: isWeekendDay
																	? "bg-gray-100/50"
																	: ""
														}`}
													>
														<form.Field name={fieldName}>
															{(field) =>
																employee.employmentType === "HOURLY" ? (
																	<input
																		type="number"
																		step="0.5"
																		min="0"
																		max="24"
																		value={field.state.value || ""}
																		onChange={(e) =>
																			field.handleChange(e.target.value)
																		}
																		onBlur={field.handleBlur}
																		className="w-full text-center px-3 py-2 text-sm font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-gray-400"
																		placeholder="0"
																	/>
																) : employee.employmentType === "DAILY" ? (
																	<div className="flex gap-1 justify-center">
																		{DAILY_ATTENDANCE_OPTIONS.map((option) => {
																			const isSelected =
																				field.state.value === option.value;
																			let color:
																				| "success"
																				| "warning"
																				| "error"
																				| "ghost" = "ghost";
																			let Icon = X;

																			if (option.value === "1") {
																				Icon = Check;
																				color = isSelected
																					? "success"
																					: "ghost";
																			} else if (option.value === "0.5") {
																				Icon = Minus;
																				color = isSelected
																					? "warning"
																					: "ghost";
																			} else {
																				Icon = X;
																				color = isSelected ? "error" : "ghost";
																			}

																			return (
																				<Button
																					key={option.value}
																					type="button"
																					onPress={() =>
																						field.handleChange(option.value)
																					}
																					color={color}
																					size="sm"
																					className={`w-8 h-8 p-0 rounded-md transition-all ${
																						isSelected ? "scale-110" : ""
																					}`}
																				>
																					<Icon size={16} strokeWidth={2.5} />
																				</Button>
																			);
																		})}
																	</div>
																) : (
																	<input
																		type="number"
																		step="0.5"
																		min="0"
																		value={field.state.value || ""}
																		onChange={(e) =>
																			field.handleChange(e.target.value)
																		}
																		onBlur={field.handleBlur}
																		className="w-full text-center px-3 py-2 text-sm font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-gray-400"
																		placeholder="0"
																	/>
																)
															}
														</form.Field>
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Sticky Save Button */}
				{employees.length > 0 && (
					<>
						{/* Mobile */}
						<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
							<form.AppForm>
								<form.SubscribeButton
									label={
										batchSave.isPending ? "Guardando..." : "Guardar Cambios"
									}
									className="w-full"
								/>
							</form.AppForm>
						</div>
						{/* Desktop */}
						<div className="hidden md:block px-4 py-3 bg-white border-t border-gray-200 sticky bottom-0">
							<div className="flex justify-end">
								<form.AppForm>
									<form.SubscribeButton
										label={
											batchSave.isPending ? "Guardando..." : "Guardar Cambios"
										}
									/>
								</form.AppForm>
							</div>
						</div>
					</>
				)}
			</form>
		</div>
	);
}
