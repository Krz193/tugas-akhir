import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { TaskRow } from '@/components/tasks/task-row';
import { TaskThreadSheet } from '@/components/tasks/task-thread-sheet';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Message } from '@/types';

import type {
    BreadcrumbItem,
    PaginatedResponse,
    Project,
    Task,
} from '@/types';

type Props = {
    tasks: PaginatedResponse<Task>;
    projects: Project[];
};

export default function MyTasksPage({ tasks, projects }: Props) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskMessages, setTaskMessages] = useState<Message[]>([]);
    const [taskSheetOpen, setTaskSheetOpen] = useState(false);
    const [loadingTaskMessages, setLoadingTaskMessages] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Tasks',
            href: '/my-tasks',
        },
    ];

    const groupedTasks = tasks.data.reduce(
        (groups, task) => {
            const projectName = task.project?.name ?? 'Unknown Project';

            if (!groups[projectName]) {
                groups[projectName] = [];
            }

            groups[projectName].push(task);

            return groups;
        },
        {} as Record<string, Task[]>,
    );

    const projectOptions = useMemo(() => projects, [projects]);

    const [projectFilter, setProjectFilter] = useState<string>(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        return new URLSearchParams(window.location.search).get('project_id') ?? '';
    });

    const getQueryParams = () => {
        if (typeof window === 'undefined') {
            return new URLSearchParams();
        }

        return new URLSearchParams(window.location.search);
    };

    const visitPage = (page: number) => {
        const params = getQueryParams();
        params.set('page', String(page));

        const url = params.toString() ? `/my-tasks?${params.toString()}` : '/my-tasks';

        router.get(url, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const pageNumbers = useMemo(() => {
        const current = tasks.current_page;
        const last = tasks.last_page;

        let start = Math.max(1, current - 2);
        let end = Math.min(last, current + 2);

        if (end - start < 4) {
            start = Math.max(1, Math.min(start, last - 4));
            end = Math.min(last, start + 4);
        }

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [tasks.current_page, tasks.last_page]);

    const fetchTaskMessages = async (taskId: number) => {
        setLoadingTaskMessages(true);

        try {
            const response = await fetch(`/tasks/${taskId}/messages`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            setTaskMessages(data.data);
        } finally {
            setLoadingTaskMessages(false);
        }
    };

    const openTaskThread = async (task: Task) => {
        setSelectedTask(task);
        setTaskSheetOpen(true);

        await fetchTaskMessages(task.id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            My Tasks
                        </h1>

                    <p className="text-sm text-muted-foreground">
                        Tasks assigned to you.
                    </p>
                </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="sr-only" htmlFor="project_filter">
                            Filter by project
                        </label>

                        <select
                            id="project_filter"
                            value={projectFilter}
                            onChange={(event) => {
                                const value = event.target.value;
                                setProjectFilter(value);

                                const params = getQueryParams();

                                if (value) {
                                    params.set('project_id', value);
                                } else {
                                    params.delete('project_id');
                                }

                                params.delete('page');

                                const url = params.toString()
                                    ? `/my-tasks?${params.toString()}`
                                    : '/my-tasks';

                                router.get(url, {}, {
                                    preserveScroll: true,
                                    preserveState: true,
                                });
                            }}
                            className="h-10 rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="">All projects</option>
                            {projectOptions.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {tasks.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No assigned tasks.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                            <div key={projectName} className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h2 className="text-lg font-semibold">
                                        {projectName}
                                    </h2>

                                    <span className="text-sm text-muted-foreground">
                                        {projectTasks.length} tasks
                                    </span>
                                </div>

                                <div className="rounded-lg border">
                                    {projectTasks.map((task) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            canDelete={false}
                                            onClick={() => openTaskThread(task)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tasks.last_page > 1 && (
                    <div className="rounded-xl border bg-background p-4">
                        <div className="mb-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                            <span>
                                Showing {tasks.from} - {tasks.to} of {tasks.total} tasks
                            </span>
                            <span>
                                Page {tasks.current_page} of {tasks.last_page}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={tasks.current_page === 1}
                                onClick={() => visitPage(1)}
                            >
                                { '<<' }
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={tasks.current_page === 1}
                                onClick={() => visitPage(tasks.current_page - 1)}
                            >
                                { '<' }
                            </Button>

                            {pageNumbers.map((page) => (
                                <Button
                                    key={page}
                                    variant={page === tasks.current_page ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => visitPage(page)}
                                    disabled={page === tasks.current_page}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={tasks.current_page === tasks.last_page}
                                onClick={() => visitPage(tasks.current_page + 1)}
                            >
                                { '>' }
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={tasks.current_page === tasks.last_page}
                                onClick={() => visitPage(tasks.last_page)}
                            >
                                { '>>' }
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <TaskThreadSheet
                task={selectedTask}
                messages={taskMessages}
                open={taskSheetOpen}
                loading={loadingTaskMessages}
                onOpenChange={setTaskSheetOpen}
                onMessageSent={() => {
                    if (selectedTask) {
                        fetchTaskMessages(selectedTask.id);
                    }
                }}
            />
        </AppLayout>
    );
}