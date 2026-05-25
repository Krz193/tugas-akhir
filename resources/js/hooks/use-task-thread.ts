import { useRef, useState } from 'react';
import type { Message, Task } from '@/types';

export function useTaskThread() {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskMessages, setTaskMessages] = useState<Message[]>([]);
    const [taskSheetOpen, setTaskSheetOpenState] = useState(false);
    const [loadingTaskMessages, setLoadingTaskMessages] = useState(false);

    const currentTaskIdRef = useRef<number | null>(null);

    const setTaskSheetOpen = (open: boolean) => {
        setTaskSheetOpenState(open);

        if (!open) {
            setSelectedTask(null);
            setTaskMessages([]);
        }
    };

    const fetchTaskMessages = async (taskId: number) => {
        currentTaskIdRef.current = taskId;

        setLoadingTaskMessages(true);

        try {
            const response = await fetch(`/tasks/${taskId}/messages`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (currentTaskIdRef.current === taskId) {
                setTaskMessages(data.data);
            }
        } finally {
            if (currentTaskIdRef.current === taskId) {
                setLoadingTaskMessages(false);
            }
        }
    };

    const openTaskThread = async (task: Task) => {
        window.history.replaceState(
            {},
            '',
            `/projects/${task.project_id}?task=${task.id}`,
        );

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
