import {
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	MenuTrigger as AriaMenuTrigger,
	Popover as AriaPopover,
	type MenuItemProps,
	type MenuProps,
	type MenuTriggerProps,
	type PopoverProps,
	Separator,
} from "react-aria-components";
import { tv } from "tailwind-variants";

const popoverClasses = tv({
	base: "bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]",
});

const menuClasses = tv({
	base: "outline-none p-1",
});

const menuItemClasses = tv({
	base: "px-3 py-2 rounded-md cursor-pointer outline-none transition-colors text-sm data-[focused]:bg-gray-100 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed flex items-center gap-2",
});

export function MenuTrigger(props: MenuTriggerProps) {
	return <AriaMenuTrigger {...props} />;
}

export function Popover({ className, ...props }: PopoverProps) {
	return (
		<AriaPopover
			{...props}
			className={popoverClasses({ class: className as string })}
		/>
	);
}

export function Menu({ className, ...props }: MenuProps<object>) {
	return (
		<AriaMenu
			{...props}
			className={menuClasses({ class: className as string })}
		/>
	);
}

export function MenuItem({ className, ...props }: MenuItemProps) {
	return (
		<AriaMenuItem
			{...props}
			className={menuItemClasses({ class: className as string })}
		/>
	);
}

export function MenuSeparator() {
	return <Separator className="my-1 h-px bg-gray-200" />;
}
