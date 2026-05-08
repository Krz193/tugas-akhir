// =============================================================================
// nav-main.tsx — Renders a labeled group of sidebar navigation links
//
// Accepts an optional `label` prop so different sidebar sections can have
// different group headings (e.g. "Platform", "Reports").
// Each item highlights automatically when its URL matches the current page.
// =============================================================================

import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

type NavMainProps = {
    items: NavItem[];
    /** Optional section heading shown above the nav items. Defaults to "Platform". */
    label?: string;
};

export function NavMain({ items = [], label = 'Platform' }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {/* Section label — e.g. "Platform" or "Reports" */}
            <SidebarGroupLabel>{label}</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            // isActive highlights the item when you're on its page
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
