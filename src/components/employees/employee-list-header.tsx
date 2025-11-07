import { Link } from "@tanstack/react-router";
import { Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeListHeaderProps {
	count: number;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	showInactive: boolean;
	onToggleInactive: (show: boolean) => void;
}

export function EmployeeListHeader({
	count,
	searchQuery,
	onSearchChange,
	showInactive,
	onToggleInactive,
}: EmployeeListHeaderProps) {
	return (
		<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="px-4 py-4 sm:px-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
							Empleados
						</h1>
						<p className="text-sm text-gray-500 mt-1">
							{count} {count === 1 ? "empleado" : "empleados"}
						</p>
					</div>
					<Link to="/employees/new">
						<Button className="flex items-center gap-2">
							<Plus className="w-4 h-4" />
							<span className="hidden sm:inline">Nuevo</span>
						</Button>
					</Link>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="text"
						placeholder="Buscar por nombre, teléfono o categoría..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
					/>
				</div>

				{/* Toggle Active/Inactive */}
				<div className="mt-3 flex gap-2">
					<Button
						onPress={() => onToggleInactive(false)}
						color={!showInactive ? "primary" : "ghost"}
						size="sm"
					>
						<User className="w-4 h-4 mr-1.5" />
						Activos
					</Button>
					<Button
						onPress={() => onToggleInactive(true)}
						color={showInactive ? "primary" : "ghost"}
						size="sm"
					>
						<User className="w-4 h-4 mr-1.5" />
						Inactivos
					</Button>
				</div>
			</div>
		</div>
	);
}
