import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

import type {
    BreadcrumbItem,
    PaginatedResponse,
    Task,
} from '@/types';

type Props = {
    tasks: PaginatedResponse<Task>;
};

function formatDate(date: string | null) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function MyTasksPage({ tasks }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Tasks',
            href: '/my-tasks',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        My Tasks
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Tasks assigned to you.
                    </p>
                </div>

                {tasks.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No assigned tasks.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground sm:flex">
                            <span className="w-28">
                                Status
                            </span>

                            <span className="flex-1">
                                Task
                            </span>

                            <span className="w-40 text-right">
                                Project
                            </span>

                            <span className="w-28 text-right">
                                Due Date
                            </span>
                        </div>

                        <div>
                            {tasks.data.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 border-b px-4 py-4 last:border-0"
                                >
                                    <span className="w-28 text-xs font-medium capitalize">
                                        {task.status.replace('_', ' ')}
                                    </span>

                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {task.title}
                                        </p>

                                        {task.description && (
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    <span className="hidden w-40 truncate text-right text-sm text-muted-foreground sm:block">
                                        {task.project?.name ?? '—'}
                                    </span>

                                    <span className="hidden w-28 items-center justify-end gap-1 text-right text-xs text-muted-foreground sm:flex">
                                        <CalendarDays className="h-3.5 w-3.5" />

                                        {formatDate(task.due_date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}