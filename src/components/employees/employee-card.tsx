import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { getEmploymentTypeInfo, getInitials } from "@/utils/employee";

interface Employee {
	id: string;
	firstName: string;
	lastName: string;
	jobCategory: string | null;
	phone: string | null;
	email: string | null;
	employmentType: string;
	isActive: boolean;
}

interface EmployeeCardProps {
	employee: Employee;
	onToggleStatus: (id: string, isActive: boolean) => void;
	isPending?: boolean;
}

export const EmployeeCard = memo(function EmployeeCard({
	employee,
	onToggleStatus,
	isPending,
}: EmployeeCardProps) {
	const typeInfo = getEmploymentTypeInfo(employee.employmentType);
	const TypeIcon = typeInfo.icon;

	return (
		<div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
			<Link
				to="/employees/$employeeId"
				params={{ employeeId: employee.id }}
				className="block p-4 sm:p-5"
			>
				<div className="flex items-start gap-3 sm:gap-4">
					{/* Avatar */}
					<div className="flex-shrink-0">
						<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-semibold text-lg">
							{getInitials(employee.firstName, employee.lastName)}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{/* Name and Status */}
						<div className="flex items-start justify-between gap-2 mb-2">
							<div className="flex-1 min-w-0">
								<h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
									{employee.firstName} {employee.lastName}
								</h3>
								{employee.jobCategory && (
									<p className="text-sm text-gray-500 capitalize truncate">
										{employee.jobCategory}
									</p>
								)}
							</div>
							<span
								className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}
							>
								<TypeIcon className="w-3.5 h-3.5" />
								<span className="hidden sm:inline">{typeInfo.label}</span>
							</span>
						</div>

						{/* Contact Info */}
						<div className="space-y-1.5">
							{employee.phone && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Phone className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{employee.phone}</span>
								</div>
							)}
							{employee.email && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Mail className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{employee.email}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</Link>

			{/* Actions */}
			<div className="px-4 sm:px-5 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className={`w-2 h-2 rounded-full ${employee.isActive ? "bg-green-500" : "bg-gray-400"}`}
					/>
					<span className="text-xs text-gray-500">
						{employee.isActive ? "Activo" : "Inactivo"}
					</span>
				</div>
				<Button
					size="sm"
					color="ghost"
					onPress={() => onToggleStatus(employee.id, !employee.isActive)}
					isDisabled={isPending}
				>
					{employee.isActive ? "Desactivar" : "Activar"}
				</Button>
			</div>
		</div>
	);
});
