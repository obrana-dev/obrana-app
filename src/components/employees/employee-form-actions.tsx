import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmployeeFormActionsProps {
	submitButton: ReactNode;
}

export function EmployeeFormActions({
	submitButton,
}: EmployeeFormActionsProps) {
	return (
		<>
			{/* Desktop Actions */}
			<div className="hidden sm:flex gap-3 pt-2">
				{submitButton}
				<Link to="/employees">
					<Button color="ghost">Cancelar</Button>
				</Link>
			</div>

			{/* Mobile Sticky Footer */}
			<div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2 shadow-lg">
				{submitButton}
				<Link to="/employees" className="block">
					<Button color="ghost" className="w-full">
						Cancelar
					</Button>
				</Link>
			</div>
		</>
	);
}
