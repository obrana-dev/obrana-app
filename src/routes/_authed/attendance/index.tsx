import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { LoadingState } from "@/components/common/loading-state";
import { AttendanceHeader } from "@/components/attendance/attendance-header";
import { DaySelector } from "@/components/attendance/day-selector";
import { EmployeeAttendanceCard } from "@/components/attendance/employee-attendance-card";
import { useAppForm } from "@/hooks/form";
import {
	useBatchSaveAttendance,
	useWeekAttendance,
	weekAttendanceQueryOptions,
} from "@/queries/attendance";
import { formatDate, getWeekDates, getWeekStart } from "@/utils/date";

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

		// First, initialize all fields to empty string
		// Use "|" as separator since it won't appear in UUIDs or dates
		employees.forEach((employee) => {
			weekDates.forEach((date) => {
				const dateStr = formatDate(date);
				const key = `${employee.id}|${dateStr}`;
				values[key] = "";
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
								{(field) => (
									<EmployeeAttendanceCard employee={employee} field={field} />
								)}
							</form.Field>
						);
					})}
					{employees.length === 0 && (
						<div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
							<p className="text-gray-500">No hay empleados activos</p>
						</div>
					)}
				</div>

				{/* Desktop: Table View */}
				<div className="hidden md:block flex-1 p-6 pb-0">
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
										{weekDates.map((date, index) => (
											<th
												key={date.toISOString()}
												className={`px-4 py-3 text-center text-xs font-semibold min-w-[120px] ${
													date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-100" : ""
												}`}
											>
												<div className="font-semibold text-gray-900">
													{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
												</div>
												<div className="text-gray-500 font-normal text-xs mt-0.5">
													{date.getDate()}/{date.getMonth() + 1}
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{employees.map((employee) => (
										<tr key={employee.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">
												{employee.firstName} {employee.lastName}
											</td>
											<td className="px-4 py-3 text-center text-xs text-gray-600 border-r border-gray-200">
												{employee.employmentType === "HOURLY" && "Hora"}
												{employee.employmentType === "DAILY" && "Día"}
												{employee.employmentType === "SUB_CONTRACTOR" && "Sub"}
											</td>
											{weekDates.map((date) => {
												const dateStr = formatDate(date);
												const fieldName = `${employee.id}|${dateStr}`;
												const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;

												return (
													<td
														key={date.toISOString()}
														className={`px-2 py-2 ${isWeekendDay ? "bg-gray-50" : ""}`}
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
																		<option value="">-</option>
																		<option value="1">Completo (1)</option>
																		<option value="0.5">Medio (0.5)</option>
																		<option value="0">Ausente (0)</option>
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
									label={batchSave.isPending ? "Guardando..." : "Guardar Cambios"}
									className="w-full"
								/>
							</form.AppForm>
						</div>
						{/* Desktop */}
						<div className="hidden md:block px-6 pb-6 pt-4">
							<div className="flex justify-end">
								<form.AppForm>
									<form.SubscribeButton
										label={batchSave.isPending ? "Guardando..." : "Guardar Cambios"}
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

