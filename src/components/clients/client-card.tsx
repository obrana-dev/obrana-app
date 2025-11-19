import { Link } from "@tanstack/react-router";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { memo } from "react";
import type { Client } from "@/db/schema";

interface ClientCardProps {
	client: Client;
}

export const ClientCard = memo(function ClientCard({
	client,
}: ClientCardProps) {
	return (
		<Link
			to="/clients/$clientId"
			params={{ clientId: client.id }}
			className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
		>
			<div className="p-4 sm:p-6">
				<div className="flex items-start gap-3">
					<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
						<Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
							{client.name}
						</h3>
						<div className="mt-2 space-y-1.5">
							{client.email && (
								<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
									<Mail className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{client.email}</span>
								</div>
							)}
							{client.phone && (
								<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
									<Phone className="w-4 h-4 flex-shrink-0" />
									<span className="truncate">{client.phone}</span>
								</div>
							)}
							{client.address && (
								<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
									<MapPin className="w-4 h-4 flex-shrink-0" />
									<span className="line-clamp-2">{client.address}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
});
