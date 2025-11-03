import { Link, useRouterState } from "@tanstack/react-router";

const menuItems = [
	{ label: "Clientes", href: "/clientes" },
	{ label: "Empleados", href: "/empleados" },
	{ label: "Trabajos", href: "/trabajos" },
	{ label: "Presupuestos", href: "/presupuestos" },
	{ label: "Proveedores", href: "/proveedores" },
];

export function Sidebar() {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	return (
		<aside className="w-64 border-r border-gray-200 bg-white">
			<div className="flex flex-col h-full">
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
	);
}
