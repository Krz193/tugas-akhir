// app-sidebar.tsx — Main sidebar shown on all authenticated pages.

import { Link } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    CheckSquare,
    FolderKanban,
    GanttChartSquare,
    LayoutGrid,
} from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

// Main nav links — href must match routes/web.php
const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Projects', href: '/projects', icon: FolderKanban },
    { title: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
];

// Report nav links — shown under a separate "Reports" label
const reportNavItems: NavItem[] = [
    { title: 'Timeline', href: '/reports/project-timeline', icon: GanttChartSquare },
    { title: 'Calendar', href: '/reports/calendar', icon: CalendarDays },
    { title: 'Performance', href: '/reports/performance', icon: BarChart3 },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Project Management" />
                <NavMain items={reportNavItems} label="Reports" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
