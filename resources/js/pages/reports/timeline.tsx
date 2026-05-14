import { Head, router } from '@inertiajs/react';
import { CalendarDays, Filter, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project, Task, TaskStatus } from '@/types';

type Filters = {
    project_id?: number | string;
    status?: TaskStatus | '';
    start_date?: string;
    end_date?: string;
};

type Props = {
    tasks: Task[];
    projects: Pick<Project, 'id' | 'name' | 'status'>[];
    filters: Filters;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/timeline' },
    { title: 'Timeline', href: '/reports/timeline' },
];

const statusLabels: Record<TaskStatus, string> = {
    todo: 'Todo',
    in_progress: 'In Progress',
    pending_review: 'Pending Review',
    done: 'Done',
};

function formatDate(date: string | null) {
    if (!date) return 'No date';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function statusClass(status: TaskStatus) {
    if (status === 'done') return 'bg-green-50 text-green-800 border-green-200';
    if (status === 'in_progress')
        return 'bg-blue-50 text-blue-800 border-blue-200';
    if (status === 'pending_review')
        return 'bg-amber-50 text-amber-800 border-amber-200';

    return 'bg-gray-50 text-gray-700 border-gray-200';
}

function cleanFilters(filters: Filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== '' && value !== undefined,
        ),
    );
}

export default function TimelineReport({
    tasks,
    projects,
    filters,
    total,
}: Props) {
    const [data, setData] = useState<Filters>({
        project_id: filters.project_id ? String(filters.project_id) : '',
        status: filters.status ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/reports/timeline', cleanFilters(data), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Timeline Report" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Timeline</h1>
                        <p className="text-sm text-muted-foreground">
                            {total} tasks across accessible projects
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
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

                    <select
                        value={data.status ?? ''}
                        onChange={(event) =>
                            setData({
                                ...data,
                                status: event.target.value as TaskStatus | '',
                            })
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={data.start_date ?? ''}
                        onChange={(event) =>
                            setData({ ...data, start_date: event.target.value })
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    />

                    <input
                        type="date"
                        value={data.end_date ?? ''}
                        onChange={(event) =>
                            setData({ ...data, end_date: event.target.value })
                        }
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    />

                    <Button type="submit">
                        <Filter className="h-4 w-4" />
                        Apply
                    </Button>
                </form>

                <div className="rounded-lg border">
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No timeline items found.
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="grid gap-3 border-b px-4 py-4 last:border-0 md:grid-cols-[1fr_auto_auto]"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-sm font-medium">
                                            {task.title}
                                        </h2>
                                        <Badge
                                            className={statusClass(task.status)}
                                            variant="outline"
                                        >
                                            {statusLabels[task.status]}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {task.project?.name ??
                                            'Unknown project'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    {formatDate(task.start_date)} -{' '}
                                    {formatDate(task.due_date)}
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <UserRound className="h-4 w-4" />
                                    {task.assignee?.name ?? 'Unassigned'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
