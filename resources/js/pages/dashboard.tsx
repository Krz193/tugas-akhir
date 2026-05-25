import { Head } from '@inertiajs/react';
import DashboardStatCard from '@/components/dashboard/dashboard-stat-card';
import RecentActivityList from '@/components/dashboard/recent-activity-list';
import AppLayout from '@/layouts/app-layout';

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    context?: string | null;
    url?: string | null;
    created_at: string;
}

interface DashboardProps {
    stats: {
        accessibleProjectsCount: number;
        assignedTasksCount: number;
        pendingReviewTasksCount: number;
        overdueTasksCount: number;
    };

    recentActivities: RecentActivity[];
}

export default function Dashboard({ stats, recentActivities }: DashboardProps) {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>

                    <p className="text-muted-foreground">
                        Project overview and work monitoring.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard
                        title="Accessible Projects"
                        value={stats.accessibleProjectsCount}
                        description="Projects you can access"
                    />

                    <DashboardStatCard
                        title="Assigned Tasks"
                        value={stats.assignedTasksCount}
                        description="Tasks assigned to you"
                    />

                    <DashboardStatCard
                        title="Pending Review"
                        value={stats.pendingReviewTasksCount}
                        description="Tasks awaiting approval"
                    />

                    <DashboardStatCard
                        title="Overdue Tasks"
                        value={stats.overdueTasksCount}
                        description="Tasks past due date"
                    />
                </div>

                <RecentActivityList activities={recentActivities} />
            </div>
        </AppLayout>
    );
}
