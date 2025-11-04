import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form";
import {
	useBatchSaveAttendance,
	useWeekAttendance,
} from "@/queries/attendance";

export const Route = createFileRoute("/_authed/attendance/")({
	component: WeeklyAttendance,
});

// Helper to get the start of the week (Monday)
function getWeekStart(date: Date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff));
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
	return date.toISOString().split("T")[0];
}

// Get array of dates for the week
function getWeekDates(weekStart: Date) {
	const dates = [];
	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + i);
		dates.push(date);
	}
	return dates;
}

const dayNames = [
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
	"Domingo",
];

function WeeklyAttendance() {
	const [currentWeekStart, setCurrentWeekStart] = useState(
		getWeekStart(new Date()),
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
	};

	if (isLoading || !employees) {
		return (
			<div className="p-6">
				<p>Cargando asistencia...</p>
			</div>
		);
	}

	return (
		<AttendanceForm
			employees={employees}
			weekDates={weekDates}
			onPreviousWeek={goToPreviousWeek}
			onNextWeek={goToNextWeek}
			onCurrentWeek={goToCurrentWeek}
		/>
	);
}

function AttendanceForm({
	employees,
	weekDates,
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

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">
					Asistencia Semanal
				</h1>
				<div className="flex items-center gap-2">
					<Button size="sm" color="ghost" onPress={onPreviousWeek}>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<Button size="sm" color="ghost" onPress={onCurrentWeek}>
						Semana Actual
					</Button>
					<Button size="sm" color="ghost" onPress={onNextWeek}>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>

			<div className="mb-4 text-gray-600">
				Semana del {weekDates[0].toLocaleDateString("es-AR")} al{" "}
				{weekDates[6].toLocaleDateString("es-AR")}
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* Attendance Grid */}
				<div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mb-6">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 border-r border-gray-200">
									Empleado
								</th>
								<th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 border-r border-gray-200">
									Tipo
								</th>
								{weekDates.map((date, index) => (
									<th
										key={date.toISOString()}
										className="px-4 py-3 text-center text-xs font-semibold text-gray-900 min-w-[100px]"
									>
										<div>{dayNames[index]}</div>
										<div className="text-gray-500 font-normal">
											{date.getDate()}/{date.getMonth() + 1}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{employees.map((employee) => (
								<tr key={employee.id} className="hover:bg-gray-50">
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
										const isWeekend =
											date.getDay() === 0 || date.getDay() === 6;

										return (
											<td
												key={date.toISOString()}
												className={`px-2 py-2 ${isWeekend ? "bg-gray-50" : ""}`}
											>
												{/* Use form.Field for raw HTML inputs in table cells */}
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
																className="w-full text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
																placeholder="0"
															/>
														) : employee.employmentType === "DAILY" ? (
															<select
																value={field.state.value || ""}
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																onBlur={field.handleBlur}
																className="w-full text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
																onChange={(e) =>
																	field.handleChange(e.target.value)
																}
																onBlur={field.handleBlur}
																className="w-full text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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

					{employees.length === 0 && (
						<div className="p-8 text-center text-gray-500">
							No hay empleados activos
						</div>
					)}
				</div>

				{/* Save Button - use form.AppForm pattern */}
				{employees.length > 0 && (
					<div className="flex justify-end">
						<form.AppForm>
							<form.SubscribeButton
								label={batchSave.isPending ? "Guardando..." : "Guardar Cambios"}
							/>
						</form.AppForm>
					</div>
				)}
			</form>
		</div>
	);
}
