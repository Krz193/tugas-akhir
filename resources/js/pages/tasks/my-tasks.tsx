import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { TaskRow } from '@/components/tasks/task-row';
import { TaskThreadSheet } from '@/components/tasks/task-thread-sheet';
import AppLayout from '@/layouts/app-layout';
import type { Message } from '@/types';

import type {
    BreadcrumbItem,
    PaginatedResponse,
    Task,
} from '@/types';

type Props = {
    tasks: PaginatedResponse<Task>;
    filters: {
        status: string | null;
        project_id: number | null;
    };
    projects: {
        id: number;
        name: string;
    }[];
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

                        <div className="space-y-6">
                            {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                                <div
                                    key={projectName}
                                    className="space-y-3"
                                >
                                    <div className="border-b pb-2">
                                        <h2 className="font-semibold">
                                            {projectName}
                                        </h2>
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