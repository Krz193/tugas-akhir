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
};

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
                    <div className="space-y-6">
                        {Object.entries(groupedTasks).map(([projectName, tasks]) => (
                            <div key={projectName} className="space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h2 className="text-lg font-semibold">
                                        {projectName}
                                    </h2>

                                    <span className="text-sm text-muted-foreground">
                                        {tasks.length} tasks
                                    </span>
                                </div>

                                <div className="rounded-lg border">
                                    {tasks.map((task) => (
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