import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu as MenuIcon, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Menu,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
	Popover,
} from "@/components/ui/menu";
import { useSession } from "@/lib/auth-client";
import { useLogout } from "@/queries/auth";

interface TopbarProps {
	onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
	const { data: session } = useSession();
	const logout = useLogout();
	const navigate = useNavigate();

	const handleSettings = () => {
		navigate({ to: "/settings" });
	};

	const handleLogout = () => {
		logout.mutate();
	};

	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="flex items-center justify-between h-16 px-4 sm:px-6">
				<div className="flex items-center gap-3">
					<Button
						onPress={onMenuClick}
						color="ghost"
						size="sm"
						className="md:hidden"
						aria-label="Toggle menu"
					>
						<MenuIcon className="w-5 h-5" />
					</Button>
					<Link
						to="/"
						className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
					>
						Obrana
					</Link>
				</div>

				<MenuTrigger>
					<Button color="ghost" size="sm" className="flex items-center gap-2">
						<User className="w-4 h-4" />
						{session?.user?.name || session?.user?.email || "Usuario"}
					</Button>
					<Popover placement="bottom end">
						<Menu>
							<MenuItem
								textValue={session?.user?.email || ""}
								className="cursor-default data-[focused]:bg-transparent"
							>
								<div className="font-medium text-gray-700">
									{session?.user?.email}
								</div>
							</MenuItem>
							<MenuSeparator />
							<MenuItem onAction={handleSettings}>
								<Settings className="w-4 h-4" />
								<span>Configuración</span>
							</MenuItem>
							<MenuItem onAction={handleLogout} className="text-error">
								<LogOut className="w-4 h-4" />
								<span>Cerrar sesión</span>
							</MenuItem>
						</Menu>
					</Popover>
				</MenuTrigger>
			</div>
		</header>
	);
}
