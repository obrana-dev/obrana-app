/**
 * Navigation configuration for the application
 * Only includes implemented routes
 */

export const navigationItems = [
	{ label: "Empleados", href: "/employees" },
	{ label: "Asistencia", href: "/attendance" },
	{ label: "Pagar Nómina", href: "/payroll" },
	{ label: "Clientes", href: "/clients" },
	{ label: "Presupuestos", href: "/quotations" },
] as const;

export type NavigationItem = (typeof navigationItems)[number];
