import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import DashboardStatCard from '@/components/dashboard/dashboard-stat-card';
import RecentActivityList from '@/components/dashboard/recent-activity-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

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
    projectSummary: {
        totalProject: number;
        activeProject: number;
        completedProject: number;
        overdueProject: number;
        totalTask: number;
        unfinishedTask: number;
    };
    recentActivities: RecentActivity[];
    incomingDueTasks: IncomingDueTask[];
    calendarData: CalendarItem[];
    selectedDate: string;
    deadlinesByDate: DeadlineItem[];
    timelineData: TimelineProject[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

function formatDate(date: string | null) {
    if (!date) return 'No date';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getMonthDays(displayMonth: Date) {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const firstDate = new Date(year, month, 1);
    const firstGridDate = new Date(firstDate);
    firstGridDate.setDate(firstDate.getDate() - firstDate.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(firstGridDate);
        date.setDate(firstGridDate.getDate() + index);
        return date;
    });
}

function CompactCalendar({
    calendarData,
    selectedDate,
    onSelectDate,
}: {
    calendarData: CalendarItem[];
    selectedDate: string;
    onSelectDate: (date: string) => void;
}) {
    const [displayMonth, setDisplayMonth] = useState(
        () => new Date(`${selectedDate}T00:00:00`),
    );

    const monthDays = useMemo(() => getMonthDays(displayMonth), [displayMonth]);

    const datesWithDeadlines = useMemo(() => {
        const dates = new Set<string>();

        calendarData.forEach((item) => {
            if (item.date) {
                dates.add(item.date);
            }
        });

        return dates;
    }, [calendarData]);

    function changeMonth(offset: number) {
        setDisplayMonth((currentMonth) => {
            const nextMonth = new Date(currentMonth);
            nextMonth.setMonth(currentMonth.getMonth() + offset);
            return nextMonth;
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Calendar</CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => changeMonth(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-36 text-center text-sm font-medium">
                        {monthLabel(displayMonth)}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => changeMonth(1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                    {dayNames.map((dayName) => (
                        <div key={dayName} className="py-1 font-medium">
                            {dayName}
                        </div>
                    ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                    {monthDays.map((date) => {
                        const key = dateKey(date);
                        const isCurrentMonth =
                            date.getMonth() === displayMonth.getMonth();
                        const isSelected = key === selectedDate;
                        const hasDeadline = datesWithDeadlines.has(key);

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSelectDate(key)}
                                className={cn(
                                    'relative flex aspect-square items-center justify-center rounded-md text-sm transition hover:bg-muted',
                                    !isCurrentMonth &&
                                        'text-muted-foreground/40',
                                    isSelected &&
                                        'bg-primary text-primary-foreground hover:bg-primary',
                                )}
                            >
                                {date.getDate()}
                                {hasDeadline && (
                                    <span
                                        className={cn(
                                            'absolute bottom-1 h-1.5 w-1.5 rounded-full bg-emerald-500',
                                            isSelected &&
                                                'bg-primary-foreground',
                                        )}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function DeadlineList({ deadlines }: { deadlines: CalendarItem[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Selected Date Deadlines</CardTitle>
            </CardHeader>

            <CardContent>
                {deadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No project or task deadlines on this date.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {deadlines.map((item, index) => (
                            <Link
                                key={`${item.type}-${item.title}-${index}`}
                                href={item.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-medium">{item.title}</p>
                                    <Badge
                                        variant={
                                            item.type === 'project'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {item.type}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {item.projectName
                                        ? `${item.projectName} · `
                                        : ''}
                                    {item.status}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function IncomingDueTaskList({ tasks }: { tasks: IncomingDueTask[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Incoming Due Tasks</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                    {tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No unfinished tasks due in the next 7 days.
                        </p>
                    ) : (
                        tasks.map((task) => (
                            <Link
                                key={task.id}
                                href={task.url}
                                className="block rounded-md border p-3 hover:bg-muted"
                            >
                                <p className="font-medium">{task.taskTitle}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {task.projectName} · {task.status} · Due{' '}
                                    {formatDate(task.dueDate)}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getTimelineRange(projects: TimelineProject[]) {
    const datedProjects = projects.filter(
        (project) => project.startDate && project.dueDate,
    );

    if (datedProjects.length === 0) {
        const today = new Date();
        return {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: new Date(today.getFullYear(), today.getMonth() + 2, 0),
        };
    }

    const timestamps = datedProjects.flatMap((project) => [
        new Date(`${project.startDate}T00:00:00`).getTime(),
        new Date(`${project.dueDate}T00:00:00`).getTime(),
    ]);

    const start = new Date(Math.min(...timestamps));
    const end = new Date(Math.max(...timestamps));

    return {
        start: new Date(start.getFullYear(), start.getMonth(), 1),
        end: new Date(end.getFullYear(), end.getMonth() + 1, 0),
    };
}

function getTimelineWeeks(start: Date, end: Date) {
    const weeks = [];
    const cursor = new Date(start);

    while (cursor <= end) {
        weeks.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 7);
    }

    return weeks;
}

function getBarStyle(
    project: TimelineProject,
    timelineStart: Date,
    totalDays: number,
) {
    if (!project.startDate || !project.dueDate) {
        return { left: '0%', width: '0%' };
    }

    const start = new Date(`${project.startDate}T00:00:00`);
    const end = new Date(`${project.dueDate}T00:00:00`);
    const startOffset =
        (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

    return {
        left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
        width: `${Math.max(2, (duration / totalDays) * 100)}%`,
    };
}

function ProjectTimeline({ projects }: { projects: TimelineProject[] }) {
    const { start, end } = useMemo(() => getTimelineRange(projects), [projects]);
    const weeks = useMemo(() => getTimelineWeeks(start, end), [start, end]);
    const totalDays =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const timelineWidth = Math.max(weeks.length * 96, 720);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Projects Timeline</CardTitle>
            </CardHeader>

            <CardContent>
                {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No projects found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <div
                            className="grid min-w-full"
                            style={{
                                gridTemplateColumns: `220px ${timelineWidth}px`,
                            }}
                        >
                            <div className="sticky left-0 z-10 border-b bg-card p-3 text-sm font-medium">
                                Project
                            </div>
                            <div className="border-b">
                                <div
                                    className="grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${weeks.length}, minmax(96px, 1fr))`,
                                    }}
                                >
                                    {weeks.map((week) => (
                                        <div
                                            key={dateKey(week)}
                                            className="border-l p-2 text-xs text-muted-foreground"
                                        >
                                            <div className="font-medium">
                                                {week.toLocaleDateString(
                                                    'en-US',
                                                    { month: 'short' },
                                                )}
                                            </div>
                                            <div>
                                                Week{' '}
                                                {Math.ceil(week.getDate() / 7)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {projects.map((project) => (
                                <div key={project.id} className="contents">
                                    <Link
                                        href={project.url}
                                        className="sticky left-0 z-10 border-b bg-card p-3 text-sm font-medium hover:bg-muted"
                                    >
                                        <span className="line-clamp-2">
                                            {project.name}
                                        </span>
                                    </Link>
                                    <div className="relative h-16 border-b">
                                        <div
                                            className="absolute inset-y-0 grid w-full"
                                            style={{
                                                gridTemplateColumns: `repeat(${weeks.length}, minmax(96px, 1fr))`,
                                            }}
                                        >
                                            {weeks.map((week) => (
                                                <div
                                                    key={dateKey(week)}
                                                    className="border-l"
                                                />
                                            ))}
                                        </div>
                                        <Link
                                            href={project.url}
                                            className="absolute top-1/2 h-6 -translate-y-1/2 rounded-md bg-primary/80 hover:bg-primary"
                                            style={getBarStyle(
                                                project,
                                                start,
                                                totalDays,
                                            )}
                                            title={`${project.name}: ${formatDate(project.startDate)} - ${formatDate(project.dueDate)}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    projectSummary,
    recentActivities,
    incomingDueTasks,
    calendarData,
    selectedDate,
    deadlinesByDate,
    timelineData,
}: DashboardProps) {
    const [selectedCalendarDate, setSelectedCalendarDate] =
        useState(selectedDate);

    const selectedDeadlines = useMemo(() => {
        if (selectedCalendarDate === selectedDate) {
            return deadlinesByDate.map((item) => ({
                ...item,
                date: selectedDate,
            }));
        }

        return calendarData.filter((item) => item.date === selectedCalendarDate);
    }, [calendarData, deadlinesByDate, selectedCalendarDate, selectedDate]);

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

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <DashboardStatCard
                                    title="Total Project"
                                    value={projectSummary.totalProject}
                                    description="Projects visible to you"
                                />
                                <DashboardStatCard
                                    title="Active Project"
                                    value={projectSummary.activeProject}
                                    description="Projects currently active"
                                />
                                <DashboardStatCard
                                    title="Completed Project"
                                    value={projectSummary.completedProject}
                                    description="Projects marked completed"
                                />
                                <DashboardStatCard
                                    title="Overdue Project"
                                    value={projectSummary.overdueProject}
                                    description="Uncompleted projects past due date"
                                />
                                <DashboardStatCard
                                    title="Total Task"
                                    value={projectSummary.totalTask}
                                    description="Tasks in visible projects"
                                />
                                <DashboardStatCard
                                    title="Unfinished Task"
                                    value={projectSummary.unfinishedTask}
                                    description="Tasks not marked done"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <CompactCalendar
                            calendarData={calendarData}
                            selectedDate={selectedCalendarDate}
                            onSelectDate={setSelectedCalendarDate}
                        />
                        <DeadlineList deadlines={selectedDeadlines} />
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <RecentActivityList activities={recentActivities} />

                    <IncomingDueTaskList tasks={incomingDueTasks} />
                </div>

                <ProjectTimeline projects={timelineData} />
            </div>
        </AppLayout>
    );
}
