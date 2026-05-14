import { Head, router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalendarDay, Project, TaskStatus } from '@/types';

type Filters = {
    project_id?: number | string;
    month?: string;
};

type Props = {
    days: CalendarDay[];
    projects: Pick<Project, 'id' | 'name' | 'status'>[];
    filters: Filters;
    daysWithTasks: number;
    totalTasks: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/calendar' },
    { title: 'Calendar', href: '/reports/calendar' },
];

const statusLabels: Record<TaskStatus, string> = {
    todo: 'Todo',
    in_progress: 'In Progress',
    pending_review: 'Pending Review',
    done: 'Done',
};

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function monthDays(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const firstDate = new Date(year, monthNumber - 1, 1);
    const lastDate = new Date(year, monthNumber, 0);
    const leadingEmptyDays = firstDate.getDay();
    const days = Array.from({ length: lastDate.getDate() }, (_, index) => {
        const day = String(index + 1).padStart(2, '0');

        return `${month}-${day}`;
    });

    return [...Array.from({ length: leadingEmptyDays }, () => null), ...days];
}

function dayLabel(date: string) {
    return Number(date.slice(-2));
}

function cleanFilters(filters: Filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== '' && value !== undefined,
        ),
    );
}

function statusClass(status: TaskStatus) {
    if (status === 'done') return 'bg-green-50 text-green-800 border-green-200';
    if (status === 'in_progress')
        return 'bg-blue-50 text-blue-800 border-blue-200';
    if (status === 'pending_review')
        return 'bg-amber-50 text-amber-800 border-amber-200';

    return 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function CalendarReport({
    days,
    projects,
    filters,
    daysWithTasks,
    totalTasks,
}: Props) {
    const [data, setData] = useState<Filters>({
        project_id: filters.project_id ? String(filters.project_id) : '',
        month: filters.month ?? currentMonth(),
    });

    const tasksByDate = useMemo(
        () => new Map(days.map((day) => [day.date, day.tasks])),
        [days],
    );

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/reports/calendar', cleanFilters(data), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar Report" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Calendar</h1>
                    <p className="text-sm text-muted-foreground">
                        {totalTasks} dated tasks on {daysWithTasks} days
                    </p>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                    <select
                        value={data.project_id ?? ''}
                        onChange={(event) =>
                            setData({ ...data, project_id: event.target.value })
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">All projects</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="month"
                        value={data.month ?? ''}
                        onChange={(event) =>
                            setData({ ...data, month: event.target.value })
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    />

                    <Button type="submit">
                        <Filter className="h-4 w-4" />
                        Apply
                    </Button>
                </form>

                <div className="overflow-hidden rounded-lg border">
                    <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-xs font-medium text-muted-foreground">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div key={day} className="px-2 py-2">
                                    {day}
                                </div>
                            ),
                        )}
                    </div>

                    <div className="grid grid-cols-7">
                        {monthDays(data.month ?? currentMonth()).map(
                            (date, index) => {
                                const tasks = date
                                    ? (tasksByDate.get(date) ?? [])
                                    : [];

                                return (
                                    <div
                                        key={date ?? `empty-${index}`}
                                        className="min-h-32 border-r border-b p-2 last:border-r-0"
                                    >
                                        {date && (
                                            <>
                                                <div className="mb-2 text-xs font-medium text-muted-foreground">
                                                    {dayLabel(date)}
                                                </div>

                                                <div className="space-y-1">
                                                    {tasks
                                                        .slice(0, 3)
                                                        .map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className="rounded-md border bg-background px-2 py-1"
                                                            >
                                                                <div className="truncate text-xs font-medium">
                                                                    {task.title}
                                                                </div>
                                                                <Badge
                                                                    className={`mt-1 ${statusClass(task.status)}`}
                                                                    variant="outline"
                                                                >
                                                                    {
                                                                        statusLabels[
                                                                            task
                                                                                .status
                                                                        ]
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        ))}

                                                    {tasks.length > 3 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            +{tasks.length - 3}{' '}
                                                            more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
