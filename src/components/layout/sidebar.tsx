import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
	{ label: "Empleados", href: "/employees" },
	{ label: "Asistencia", href: "/attendance" },
	{ label: "Pagar Nómina", href: "/payroll" },
	{ label: "Clientes", href: "/clientes" },
	{ label: "Trabajos", href: "/trabajos" },
	{ label: "Presupuestos", href: "/presupuestos" },
	{ label: "Proveedores", href: "/proveedores" },
];

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
	const router = useRouterState();
	const currentPath = router.location.pathname;
	const prevPathRef = useRef(currentPath);

	// Close sidebar on route change (mobile)
	useEffect(() => {
		if (prevPathRef.current !== currentPath) {
			onClose();
			prevPathRef.current = currentPath;
		}
	}, [currentPath, onClose]);

	// Prevent body scroll when sidebar is open on mobile
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Backdrop for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
					fixed md:static inset-y-0 left-0 z-50
					w-64 border-r border-gray-200 bg-white
					transform transition-transform duration-300 ease-in-out
					md:transform-none
					${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
				`}
			>
				<div className="flex flex-col h-full">
					{/* Mobile header with close button */}
					<div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Menú</h2>
						<Button
							onPress={onClose}
							color="ghost"
							size="sm"
							aria-label="Close menu"
						>
							<X className="w-5 h-5" />
						</Button>
					</div>

					{/* Navigation items */}
					<nav className="flex-1 px-3 py-4">
						<ul className="space-y-1">
							{menuItems.map((item) => {
								const isActive = currentPath === item.href;
								return (
									<li key={item.href}>
										<Link
											to={item.href}
											className={`
												block px-3 py-2 rounded-md text-sm font-medium transition-colors
												${
													isActive
														? "bg-primary text-white"
														: "text-gray-700 hover:bg-gray-100"
												}
											`}
										>
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
			</aside>
		</>
	);
}
