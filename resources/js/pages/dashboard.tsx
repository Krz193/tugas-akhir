import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import DashboardStatCard from '@/components/dashboard/dashboard-stat-card';
import RecentActivityList from '@/components/dashboard/recent-activity-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface RecentActivity {
    taskTitle: string;
    projectName: string;
    status: string;
    updatedAt: string;
    url?: string | null;
}

interface IncomingDueTask {
    id: number;
    taskTitle: string;
    projectName: string;
    status: string;
    dueDate: string | null;
    url: string;
}

interface CalendarItem {
    type: 'project' | 'task';
    title: string;
    projectName?: string;
    date: string | null;
    status: string;
    url: string;
}

interface DeadlineItem {
    type: 'project' | 'task';
    title: string;
    projectName?: string;
    status: string;
    url: string;
}

interface TimelineProject {
    id: number;
    name: string;
    status: string;
    startDate: string | null;
    dueDate: string | null;
    url: string;
}

interface DashboardProps {
    summary: {
        totalProject: number;
        activeProject: number;
        completedProject: number;
        overdueProject: number;
        totalTask: number;
        unfinishedTask: number;
    };
    recentActivities: RecentActivity[];
    incomingDueTasks: IncomingDueTask[];
    calendarItems: CalendarItem[];
    selectedDate: string;
    selectedDateDeadlines: DeadlineItem[];
    timelineProjects: TimelineProject[];
}

function formatDate(date: string | null) {
    if (!date) return 'No date';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function SimpleList({
    title,
    emptyText,
    children,
}: {
    title: string;
    emptyText: string;
    children: ReactNode[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {emptyText}
                    </p>
                ) : (
                    <div className="space-y-3">{children}</div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    summary,
    recentActivities,
    incomingDueTasks,
    calendarItems,
    selectedDate,
    selectedDateDeadlines,
    timelineProjects,
}: DashboardProps) {
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

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <DashboardStatCard
                        title="Total Project"
                        value={summary.totalProject}
                        description="Projects visible to you"
                    />

                    <DashboardStatCard
                        title="Active Project"
                        value={summary.activeProject}
                        description="Projects currently active"
                    />

                    <DashboardStatCard
                        title="Completed Project"
                        value={summary.completedProject}
                        description="Projects marked completed"
                    />

                    <DashboardStatCard
                        title="Overdue Project"
                        value={summary.overdueProject}
                        description="Uncompleted projects past due date"
                    />

                    <DashboardStatCard
                        title="Total Task"
                        value={summary.totalTask}
                        description="Tasks in visible projects"
                    />

                    <DashboardStatCard
                        title="Unfinished Task"
                        value={summary.unfinishedTask}
                        description="Tasks not marked done"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <RecentActivityList activities={recentActivities} />

                    <SimpleList
                        title="Incoming Due Tasks"
                        emptyText="No unfinished tasks due in the next 7 days."
                    >
                        {incomingDueTasks.map((task) => (
                            <a
                                key={task.id}
                                href={task.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <p className="font-medium">{task.taskTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                    {task.projectName} · {task.status} · Due{' '}
                                    {formatDate(task.dueDate)}
                                </p>
                            </a>
                        ))}
                    </SimpleList>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <SimpleList
                        title="Calendar"
                        emptyText="No project or task dates found."
                    >
                        {calendarItems.slice(0, 10).map((item, index) => (
                            <a
                                key={`${item.type}-${item.title}-${index}`}
                                href={item.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.type} · {item.status} ·{' '}
                                    {formatDate(item.date)}
                                </p>
                            </a>
                        ))}
                    </SimpleList>

                    <SimpleList
                        title={`Deadlines on ${formatDate(selectedDate)}`}
                        emptyText="No project or task deadlines on this date."
                    >
                        {selectedDateDeadlines.map((item, index) => (
                            <a
                                key={`${item.type}-${item.title}-${index}`}
                                href={item.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.projectName
                                        ? `${item.projectName} · `
                                        : ''}
                                    {item.type} · {item.status}
                                </p>
                            </a>
                        ))}
                    </SimpleList>

                    <SimpleList
                        title="Project Timeline"
                        emptyText="No projects found."
                    >
                        {timelineProjects.map((project) => (
                            <a
                                key={project.id}
                                href={project.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <p className="font-medium">{project.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {project.status} ·{' '}
                                    {formatDate(project.startDate)} -{' '}
                                    {formatDate(project.dueDate)}
                                </p>
                            </a>
                        ))}
                    </SimpleList>
                </div>
            </div>
        </AppLayout>
    );
}
