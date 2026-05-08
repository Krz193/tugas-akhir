// =============================================================================
// app-sidebar.tsx — The main sidebar with navigation links
//
// This sidebar is visible on all authenticated pages. It lists the main
// sections of the app. Role-aware items (like "Create Project") are handled
// inside the individual pages, not here — keeping the sidebar simple.
// =============================================================================

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

// -----------------------------------------------------------------------------
// Main navigation items
// Each item maps to one section of the app.
// The `href` string must match the route defined in routes/web.php.
// -----------------------------------------------------------------------------

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Projects',
        href: '/projects', // → projects.index
        icon: FolderKanban,
    },
    {
        title: 'My Tasks',
        href: '/my-tasks', // → tasks.my
        icon: CheckSquare,
    },
];

// -----------------------------------------------------------------------------
// Report navigation items — grouped separately so we can label them later.
// For now they're merged into mainNavItems. We can split them into a second
// NavMain group when the Reports section grows.
// -----------------------------------------------------------------------------

const reportNavItems: NavItem[] = [
    {
        title: 'Timeline',
        href: '/reports/timeline', // → reports.timeline
        icon: GanttChartSquare,
    },
    {
        title: 'Calendar',
        href: '/reports/calendar', // → reports.calendar
        icon: CalendarDays,
    },
    {
        title: 'Performance',
        href: '/reports/performance', // → reports.performance
        icon: BarChart3,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Logo at the top — clicking it goes to the dashboard */}
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
                {/* Main section: Dashboard, Projects, My Tasks */}
                <NavMain items={mainNavItems} />

                {/* Reports section: Timeline, Calendar, Performance */}
                <NavMain items={reportNavItems} label="Reports" />
            </SidebarContent>

            <SidebarFooter>
                {/* User avatar + logout dropdown at the bottom */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
