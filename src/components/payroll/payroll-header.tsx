import { Link } from "@tanstack/react-router";
import { History } from "lucide-react";

export function PayrollHeader() {
	return (
		<div className="flex items-center justify-between mb-6">
			<h1 className="text-2xl font-bold text-gray-900">Nómina</h1>
			<Link
				to="/payroll/history"
				className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
			>
				<History size={18} />
				Historial
			</Link>
		</div>
	);
}
