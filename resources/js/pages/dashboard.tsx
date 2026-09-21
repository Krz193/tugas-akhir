import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import RecentActivityList from '@/components/dashboard/recent-activity-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    progressPercentage: number | null;
    url: string;
}

interface TeamMember {
    id: number;
    name: string;
    divisionName: string | null;
}

interface ProjectMetricRecord {
    id: number;
    name: string;
    status: string;
    startDate: string | null;
    dueDate: string | null;
    url: string;
}

interface TaskMetricRecord {
    id: number;
    title: string;
    status: string;
    dueDate: string | null;
    projectName: string;
    assigneeName: string;
}

type MetricKey =
    | 'totalProject'
    | 'activeProject'
    | 'overdueProject'
    | 'totalTask'
    | 'unfinishedTask'
    | 'overdueTask';

interface DashboardProps {
    projectSummary: {
        totalProject: number;
        activeProject: number;
        overdueProject: number;
        totalTask: number;
        unfinishedTask: number;
        overdueTask: number;
    };
    metricRecords: {
        totalProject: ProjectMetricRecord[];
        activeProject: ProjectMetricRecord[];
        overdueProject: ProjectMetricRecord[];
        totalTask: TaskMetricRecord[];
        unfinishedTask: TaskMetricRecord[];
        overdueTask: TaskMetricRecord[];
    };
    teamMembers: TeamMember[];
    selectedEmployeeId: number | null;
    recentActivities: RecentActivity[];
    incomingDueTasks: IncomingDueTask[];
    calendarData: CalendarItem[];
    selectedDate: string;
    deadlinesByDate: DeadlineItem[];
    timelineData: TimelineProject[];
    startMonth: string;
    endMonth: string;
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

function DeadlineModal({
    open,
    selectedDate,
    deadlines,
    onOpenChange,
}: {
    open: boolean;
    selectedDate: string;
    deadlines: CalendarItem[];
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[32rem] max-h-[85vh] flex-col sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Deadlines on {formatDate(selectedDate)}
                    </DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                    {deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No project or task deadlines on this date.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {deadlines.map((item, index) => {
                                const content = (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-medium">
                                                {item.title}
                                            </p>
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
                                    </>
                                );

                                if (item.type === 'project') {
                                    return (
                                        <Link
                                            key={`${item.type}-${item.title}-${index}`}
                                            href={item.url}
                                            className="block rounded-md border p-3 hover:bg-muted"
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <div
                                        key={`${item.type}-${item.title}-${index}`}
                                        className="rounded-md border p-3"
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MetricCard({
    title,
    value,
    description,
    onClick,
}: {
    title: string;
    value: number;
    description: string;
    onClick: () => void;
}) {
    return (
        <button type="button" className="text-left" onClick={onClick}>
            <Card className="h-full transition hover:border-primary/60 hover:bg-muted/40">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </button>
    );
}

function MetricModal({
    open,
    title,
    metricKey,
    metricRecords,
    onOpenChange,
}: {
    open: boolean;
    title: string;
    metricKey: MetricKey | null;
    metricRecords: DashboardProps['metricRecords'];
    onOpenChange: (open: boolean) => void;
}) {
    const isProjectMetric =
        metricKey === 'totalProject' ||
        metricKey === 'activeProject' ||
        metricKey === 'overdueProject';

    const records = metricKey ? metricRecords[metricKey] : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[32rem] max-h-[85vh] flex-col sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                    {records.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No records found for this metric.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {isProjectMetric
                                ? (records as ProjectMetricRecord[]).map(
                                      (project) => (
                                          <Link
                                              key={project.id}
                                              href={project.url}
                                              className="block rounded-md border p-3 hover:bg-muted"
                                          >
                                              <div className="flex items-center justify-between gap-3">
                                                  <p className="font-medium">
                                                      {project.name}
                                                  </p>
                                                  <Badge>{project.status}</Badge>
                                              </div>
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                  {formatDate(
                                                      project.startDate,
                                                  )}{' '}
                                                  -{' '}
                                                  {formatDate(project.dueDate)}
                                              </p>
                                          </Link>
                                      ),
                                  )
                                : (records as TaskMetricRecord[]).map(
                                      (task) => (
                                          <div
                                              key={task.id}
                                              className="rounded-md border p-3"
                                          >
                                              <div className="flex items-center justify-between gap-3">
                                                  <p className="font-medium">
                                                      {task.title}
                                                  </p>
                                                  <Badge variant="secondary">
                                                      {task.status}
                                                  </Badge>
                                              </div>
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                  {task.projectName} ·{' '}
                                                  {task.assigneeName} · Due{' '}
                                                  {formatDate(task.dueDate)}
                                              </p>
                                          </div>
                                      ),
                                  )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
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
                            <div
                                key={task.id}
                                className="rounded-md border p-3"
                            >
                                <p className="font-medium">{task.taskTitle}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {task.projectName} · {task.status} · Due{' '}
                                    {formatDate(task.dueDate)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getTimelineRange(
    projects: TimelineProject[],
    startMonth?: string,
    endMonth?: string,
) {
    if (startMonth && endMonth) {
        const [sYear, sMonth] = startMonth.split('-').map(Number);
        const [eYear, eMonth] = endMonth.split('-').map(Number);
        const start = new Date(sYear, sMonth - 1, 1);
        const end = new Date(eYear, eMonth, 0); // Last day of endMonth
        return { start, end };
    }

    if (startMonth) {
        const [sYear, sMonth] = startMonth.split('-').map(Number);
        const start = new Date(sYear, sMonth - 1, 1);
        const end = new Date(sYear, sMonth + 2, 0);
        return { start, end };
    }

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
    timelineEnd: Date,
    totalDays: number,
) {
    if (!project.startDate && !project.dueDate) {
        return { left: '0%', width: '0%', isHidden: true };
    }

    const start = project.startDate
        ? new Date(`${project.startDate}T00:00:00`)
        : timelineStart;
    const end = project.dueDate
        ? new Date(`${project.dueDate}T00:00:00`)
        : timelineEnd;

    // Check if outside viewport completely
    if (end < timelineStart || start > timelineEnd) {
        return { left: '0%', width: '0%', isHidden: true };
    }

    // Clamp to viewport
    const clampedStart = Math.max(start.getTime(), timelineStart.getTime());
    const clampedEnd = Math.min(end.getTime(), timelineEnd.getTime());

    const startOffset =
        (clampedStart - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const duration =
        (clampedEnd - clampedStart) / (1000 * 60 * 60 * 24) + 1;

    return {
        left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
        width: `${Math.max(2, (duration / totalDays) * 100)}%`,
        isContinuedLeft: start < timelineStart,
        isContinuedRight: end > timelineEnd,
        isHidden: false,
    };
}

function getStatusColor(status: string) {
    switch (status) {
        case 'completed':
            return {
                bg: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
                fill: 'bg-emerald-500',
            };
        case 'active':
            return {
                bg: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-700 dark:text-blue-300',
                fill: 'bg-blue-600',
            };
        case 'on_hold':
            return {
                bg: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-700 dark:text-amber-300',
                fill: 'bg-amber-500',
            };
        default:
            return {
                bg: 'bg-primary/20 hover:bg-primary/30 border-primary/40 text-primary',
                fill: 'bg-primary',
            };
    }
}

function ProjectTimeline({
    projects,
    startMonth,
    endMonth,
}: {
    projects: TimelineProject[];
    startMonth?: string;
    endMonth?: string;
}) {
    const { start, end } = useMemo(
        () => getTimelineRange(projects, startMonth, endMonth),
        [projects, startMonth, endMonth],
    );
    const weeks = useMemo(() => getTimelineWeeks(start, end), [start, end]);
    const totalDays =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const timelineWidth = Math.max(weeks.length * 96, 720);

    const today = new Date();
    const todayOffset =
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const todayPercent = (todayOffset / totalDays) * 100;
    const showToday = today >= start && today <= end;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                    <CardTitle>Projects Timeline</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {startMonth && endMonth
                            ? `Showing period: ${startMonth} to ${endMonth}`
                            : 'All visible projects'}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">Completed</span>
                    </div>
                    {showToday && (
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-0.5 bg-rose-500" />
                            <span className="text-muted-foreground">Today</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No projects found in this period.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <div
                            className="grid min-w-full"
                            style={{
                                gridTemplateColumns: `220px ${timelineWidth}px`,
                            }}
                        >
                            <div className="sticky left-0 z-20 border-b bg-card p-3 text-sm font-semibold">
                                Project
                            </div>
                            <div className="relative border-b">
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

                            {projects.map((project) => {
                                const bar = getBarStyle(
                                    project,
                                    start,
                                    end,
                                    totalDays,
                                );
                                const colors = getStatusColor(project.status);

                                return (
                                    <div key={project.id} className="contents">
                                        <Link
                                            href={project.url}
                                            className="sticky left-0 z-10 flex flex-col justify-center border-b bg-card p-3 text-sm hover:bg-muted"
                                        >
                                            <span className="line-clamp-1 font-medium">
                                                {project.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {project.progressPercentage !== null
                                                    ? `${project.progressPercentage}% progress`
                                                    : 'No tasks'}
                                            </span>
                                        </Link>
                                        <div className="relative h-16 border-b">
                                            {/* Column lines */}
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

                                            {/* Today indicator vertical line */}
                                            {showToday && (
                                                <div
                                                    className="absolute inset-y-0 z-10 border-r-2 border-dashed border-rose-500/80 pointer-events-none"
                                                    style={{
                                                        left: `${todayPercent}%`,
                                                    }}
                                                    title={`Today: ${formatDate(today.toISOString())}`}
                                                />
                                            )}

                                            {/* Project bar */}
                                            {!bar.isHidden && (
                                                <Link
                                                    href={project.url}
                                                    className={cn(
                                                        'group absolute top-1/2 h-7 -translate-y-1/2 overflow-hidden rounded-md border text-xs transition-all shadow-sm',
                                                        colors.bg,
                                                        bar.isContinuedLeft && 'rounded-l-none border-l-dashed border-l-2',
                                                        bar.isContinuedRight && 'rounded-r-none border-r-dashed border-r-2',
                                                    )}
                                                    style={{
                                                        left: bar.left,
                                                        width: bar.width,
                                                    }}
                                                    title={`${project.name} (${project.status}): ${formatDate(project.startDate)} - ${formatDate(project.dueDate)} | Progress: ${project.progressPercentage ?? 0}%`}
                                                >
                                                    {/* Progress fill */}
                                                    {project.progressPercentage !== null && (
                                                        <div
                                                            className={cn(
                                                                'absolute inset-y-0 left-0 opacity-25 group-hover:opacity-35 transition-opacity',
                                                                colors.fill,
                                                            )}
                                                            style={{
                                                                width: `${project.progressPercentage}%`,
                                                            }}
                                                        />
                                                    )}

                                                    <div className="relative z-10 flex h-full items-center justify-between px-2 font-medium truncate">
                                                        <span className="truncate">
                                                            {project.name}
                                                        </span>
                                                        {project.progressPercentage !== null && (
                                                            <span className="ml-1.5 text-[10px] font-semibold opacity-80">
                                                                {project.progressPercentage}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    projectSummary,
    metricRecords,
    teamMembers,
    selectedEmployeeId,
    recentActivities,
    incomingDueTasks,
    calendarData,
    selectedDate,
    deadlinesByDate,
    timelineData,
    startMonth,
    endMonth,
}: DashboardProps) {
    const [selectedCalendarDate, setSelectedCalendarDate] =
        useState(selectedDate);
    const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
    const [selectedMetricKey, setSelectedMetricKey] =
        useState<MetricKey | null>(null);

    const selectedDeadlines = useMemo(() => {
        if (selectedCalendarDate === selectedDate) {
            return deadlinesByDate.map((item) => ({
                ...item,
                date: selectedDate,
            }));
        }

        return calendarData.filter((item) => item.date === selectedCalendarDate);
    }, [calendarData, deadlinesByDate, selectedCalendarDate, selectedDate]);

    const metricTitles: Record<MetricKey, string> = {
        totalProject: 'Total Project',
        activeProject: 'Active Project',
        overdueProject: 'Overdue Project',
        totalTask: 'Total Task',
        unfinishedTask: 'Unfinished Task',
        overdueTask: 'Overdue Task',
    };

    function openMetricModal(metricKey: MetricKey) {
        setSelectedMetricKey(metricKey);
    }

    function changeTeamMemberFilter(employeeId: string) {
        router.get(
            '/dashboard',
            {
                employee_id: employeeId || undefined,
                start_month: startMonth || undefined,
                end_month: endMonth || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function applyDateFilter(start: string, end: string) {
        router.get(
            '/dashboard',
            {
                employee_id: selectedEmployeeId || undefined,
                start_month: start || undefined,
                end_month: end || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    function selectCalendarDate(date: string) {
        setSelectedCalendarDate(date);
        setDeadlineModalOpen(true);
    }

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
                        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between pb-4">
                            <CardTitle>Project Metrics</CardTitle>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/dashboard/export?employee_id=${selectedEmployeeId || ''}&start_month=${startMonth || ''}&end_month=${endMonth || ''}`}
                                    className="inline-flex h-8 items-center justify-center rounded-md border bg-primary px-3 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    Export Excel
                                </a>

                                <div className="mx-2 h-4 w-px bg-border"></div>

                                <input
                                    type="month"
                                    className="h-8 rounded-md border bg-background px-2 text-xs"
                                    value={startMonth}
                                    onChange={(e) => applyDateFilter(e.target.value, endMonth)}
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <input
                                    type="month"
                                    className="h-8 rounded-md border bg-background px-2 text-xs"
                                    value={endMonth}
                                    onChange={(e) => applyDateFilter(startMonth, e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <MetricCard
                                    title="Total Project"
                                    value={projectSummary.totalProject}
                                    description="Projects visible to you"
                                    onClick={() =>
                                        openMetricModal('totalProject')
                                    }
                                />
                                <MetricCard
                                    title="Active Project"
                                    value={projectSummary.activeProject}
                                    description="Projects currently active"
                                    onClick={() =>
                                        openMetricModal('activeProject')
                                    }
                                />
                                <MetricCard
                                    title="Overdue Project"
                                    value={projectSummary.overdueProject}
                                    description="Uncompleted projects past due date"
                                    onClick={() =>
                                        openMetricModal('overdueProject')
                                    }
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle>Task Performance Metrics</CardTitle>
                                <select
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                    value={selectedEmployeeId ?? ''}
                                    onChange={(event) =>
                                        changeTeamMemberFilter(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">All Team Members</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name}
                                            {member.divisionName
                                                ? ` - ${member.divisionName}`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <MetricCard
                                    title="Total Task"
                                    value={projectSummary.totalTask}
                                    description="Tasks in visible projects"
                                    onClick={() => openMetricModal('totalTask')}
                                />
                                <MetricCard
                                    title="Unfinished Task"
                                    value={projectSummary.unfinishedTask}
                                    description="Tasks not marked done"
                                    onClick={() =>
                                        openMetricModal('unfinishedTask')
                                    }
                                />
                                <MetricCard
                                    title="Overdue Task"
                                    value={projectSummary.overdueTask}
                                    description="Unfinished tasks past due date"
                                    onClick={() =>
                                        openMetricModal('overdueTask')
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <CompactCalendar
                        calendarData={calendarData}
                        selectedDate={selectedCalendarDate}
                        onSelectDate={selectCalendarDate}
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <RecentActivityList activities={recentActivities} />

                    <IncomingDueTaskList tasks={incomingDueTasks} />
                </div>

                <ProjectTimeline
                    projects={timelineData}
                    startMonth={startMonth}
                    endMonth={endMonth}
                />
            </div>

            <DeadlineModal
                open={deadlineModalOpen}
                selectedDate={selectedCalendarDate}
                deadlines={selectedDeadlines}
                onOpenChange={setDeadlineModalOpen}
            />

            <MetricModal
                open={selectedMetricKey !== null}
                title={selectedMetricKey ? metricTitles[selectedMetricKey] : ''}
                metricKey={selectedMetricKey}
                metricRecords={metricRecords}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMetricKey(null);
                    }
                }}
            />
        </AppLayout>
    );
}
