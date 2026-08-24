import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

import { useAuthUser } from '@/hooks/use-auth-user';

import type { Task, TaskStatus } from '@/types';

function formatDate(date: string | null) {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function statusSelectClass(status: TaskStatus) {
    if (status === 'done') {
        return 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/60 dark:text-green-300';
    }

    if (status === 'in_progress') {
        return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
    }

    return 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
}

type TaskRowProps = {
    task: Task;
    canDelete: boolean;
    canEdit?: boolean;
    canOpenDetail?: boolean;
    onClick: () => void;
    onEdit?: () => void;
};

export function TaskRow({
    task,
    canDelete,
    canEdit = false,
    canOpenDetail = true,
    onClick,
    onEdit,
}: TaskRowProps) {
    const { user, isTeamMember } = useAuthUser();

    const employeeId = user.employee?.id;
    const canUpdateStatus =
        isTeamMember() && task.assigned_employee_id === employeeId;

    function handleStatusChange(newStatus: string) {
        router.patch(`/tasks/${task.id}/status`, {
            status: newStatus,
        });
    }

    function handleDelete() {
        if (window.confirm(`Delete "${task.title}"?`)) {
            router.delete(`/tasks/${task.id}`);
        }
    }

    return (
        <div
            onClick={() => {
                if (canOpenDetail) {
                    onClick();
                }
            }}
            className={`flex items-center gap-3 border-b px-5 py-3 transition-colors last:border-0 ${
                canOpenDetail
                    ? 'cursor-pointer hover:bg-muted/50'
                    : 'cursor-default'
            }`}
        >
            <div className="w-28">
                {!canUpdateStatus ? (
                    <div
                        className={`flex h-9 items-center justify-center rounded-md border text-xs font-medium shadow-sm transition-colors ${statusSelectClass(task.status)}`}
                    >
                        {task.status.replace('_', ' ')}
                    </div>
                ) : (
                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={!canUpdateStatus}
                        className={`h-9 w-full rounded-md border px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${statusSelectClass(task.status)}`}
                    >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                )}
            </div>

            <div className="flex flex-1 items-center gap-2">
                <span className="text-sm font-medium">{task.title}</span>
            </div>

            <span className="hidden w-32 truncate text-right text-xs text-muted-foreground sm:block">
                {task.assignee?.name ?? '—'}
            </span>

            <span className="hidden w-24 text-right text-xs text-muted-foreground sm:block">
                {task.due_date ? formatDate(task.due_date) : '—'}
            </span>

            {(canEdit || canDelete) && (
                <div className="flex w-16 justify-end gap-2">
                    {canEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit task"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    )}

                    {canDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete task"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
