import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Filter,
    ListTodo,
    RotateCcw,
    TimerOff,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PerformanceMetrics, Project } from '@/types';

type Filters = {
    project_id?: number | string;
};

type Props = {
    metrics: PerformanceMetrics;
    projects: Pick<Project, 'id' | 'name' | 'status'>[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/performance' },
    { title: 'Performance', href: '/reports/performance' },
];

function cleanFilters(filters: Filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== '' && value !== undefined,
        ),
    );
}

function metricRows(metrics: PerformanceMetrics) {
    return [
        {
            label: 'Todo',
            value: metrics.todo_tasks,
            icon: ListTodo,
            bar: 'bg-gray-500',
        },
        {
            label: 'In Progress',
            value: metrics.in_progress_tasks,
            icon: Clock3,
            bar: 'bg-blue-600',
        },
        {
            label: 'Pending Review',
            value: metrics.pending_review_tasks,
            icon: RotateCcw,
            bar: 'bg-amber-500',
        },
        {
            label: 'Done',
            value: metrics.done_tasks,
            icon: CheckCircle2,
            bar: 'bg-green-600',
        },
    ];
}

export default function PerformanceReport({
    metrics,
    projects,
    filters,
}: Props) {
    const [data, setData] = useState<Filters>({
        project_id: filters.project_id ? String(filters.project_id) : '',
    });

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/reports/performance', cleanFilters(data), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    const rows = metricRows(metrics);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Performance Report" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Performance</h1>
                    <p className="text-sm text-muted-foreground">
                        {metrics.total_tasks} tasks in accessible projects
                    </p>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto]"
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

                    <Button type="submit">
                        <Filter className="h-4 w-4" />
                        Apply
                    </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold">
                                {metrics.total_tasks}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-3xl font-semibold">
                                {metrics.completion_rate}%
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{
                                        width: `${metrics.completion_rate}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overdue</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <TimerOff className="h-8 w-8 text-destructive" />
                            <div className="text-3xl font-semibold">
                                {metrics.overdue_tasks}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-lg border">
                    {rows.map((row) => {
                        const Icon = row.icon;
                        const percentage =
                            metrics.total_tasks > 0
                                ? Math.round(
                                      (row.value / metrics.total_tasks) * 100,
                                  )
                                : 0;

                        return (
                            <div
                                key={row.label}
                                className="grid gap-3 border-b px-4 py-4 last:border-0 sm:grid-cols-[180px_1fr_80px]"
                            >
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    {row.label}
                                </div>

                                <div className="flex items-center">
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full ${row.bar}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-right text-sm text-muted-foreground">
                                    {row.value} ({percentage}%)
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
