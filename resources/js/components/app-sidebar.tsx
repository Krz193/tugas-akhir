// Sidebar utama untuk halaman setelah login.

import { Link } from '@inertiajs/react';
import { CheckSquare, FolderKanban, LayoutGrid, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuthUser } from '@/hooks/use-auth-user';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const dashboardNavItem: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { isProjectManager, isBusinessDeveloper, isTeamMember } =
        useAuthUser();
    const canViewDashboard = isProjectManager() || isBusinessDeveloper();
    const homeHref = canViewDashboard ? dashboard() : '/my-tasks';

    const roleNavItems: NavItem[] = [];

    if (isProjectManager()) {
        roleNavItems.push(
            { title: 'Users', href: '/users', icon: Users },
            { title: 'Projects', href: '/projects', icon: FolderKanban },
        );
    }

    if (isBusinessDeveloper()) {
        roleNavItems.push({
            title: 'Projects',
            href: '/projects',
            icon: FolderKanban,
        });
    }

    if (isTeamMember()) {
        roleNavItems.push({
            title: 'My Tasks',
            href: '/my-tasks',
            icon: CheckSquare,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {canViewDashboard && <NavMain items={dashboardNavItem} />}
                <NavMain items={roleNavItems} label="Menu" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
