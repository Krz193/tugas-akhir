import { useState } from 'react';
import type { Message, Task } from '@/types';

export function useTaskThread() {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskMessages, setTaskMessages] = useState<Message[]>([]);
    const [taskSheetOpen, setTaskSheetOpen] = useState(false);
    const [loadingTaskMessages, setLoadingTaskMessages] = useState(false);

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

    return {
        selectedTask,
        taskMessages,
        taskSheetOpen,
        loadingTaskMessages,

        setTaskSheetOpen,

        fetchTaskMessages,
        openTaskThread,
    };
}