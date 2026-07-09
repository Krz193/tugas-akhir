import { router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { Employee, Task, TaskStatus } from '@/types';

type EditTaskDialogProps = {
    task: Task | null;
    assignees: Employee[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type TaskFormData = {
    title: string;
    description: string;
    assigned_employee_id: string;
    status: TaskStatus;
    start_date: string;
    due_date: string;
};

type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

export function EditTaskDialog({
    task,
    assignees,
    open,
    onOpenChange,
}: EditTaskDialogProps) {
    const [data, setData] = useState<TaskFormData>({
        title: '',
        description: '',
        assigned_employee_id: '',
        status: 'todo',
        start_date: '',
        due_date: '',
    });
    const [errors, setErrors] = useState<TaskFormErrors>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!task) {
            return;
        }

        setData({
            title: task.title ?? '',
            description: task.description ?? '',
            assigned_employee_id: task.assigned_employee_id
                ? String(task.assigned_employee_id)
                : '',
            status: task.status,
            start_date: task.start_date?.slice(0, 10) ?? '',
            due_date: task.due_date?.slice(0, 10) ?? '',
        });
        setErrors({});
    }, [task]);

    function updateField(key: keyof TaskFormData, value: string) {
        setData((currentData) => ({
            ...currentData,
            [key]: value,
        }));
    }

    function csrfToken() {
        return (
            document
                .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? ''
        );
    }

    function readableErrors(errorData: Record<string, string[] | string>) {
        const nextErrors: TaskFormErrors = {};

        Object.entries(errorData).forEach(([key, value]) => {
            nextErrors[key as keyof TaskFormData] = Array.isArray(value)
                ? value[0]
                : value;
        });

        return nextErrors;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!task) {
            return;
        }

        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch(`/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify(data),
            });

            if (response.status === 422) {
                const responseData = await response.json();
                setErrors(readableErrors(responseData.errors ?? {}));
                return;
            }

            if (!response.ok) {
                return;
            }

            onOpenChange(false);
            router.reload();
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-task-title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-task-title"
                            value={data.title}
                            onChange={(e) =>
                                updateField('title', e.target.value)
                            }
                            disabled={processing}
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-task-description">
                            Description
                        </Label>
                        <textarea
                            id="edit-task-description"
                            rows={2}
                            value={data.description}
                            onChange={(e) =>
                                updateField('description', e.target.value)
                            }
                            disabled={processing}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-task-assignee">
                                Assign To
                            </Label>
                            <select
                                id="edit-task-assignee"
                                value={data.assigned_employee_id}
                                onChange={(e) =>
                                    updateField(
                                        'assigned_employee_id',
                                        e.target.value,
                                    )
                                }
                                disabled={processing}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Unassigned</option>
                                {assignees.map((employee) => (
                                    <option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.assigned_employee_id} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-task-status">Status</Label>
                            <select
                                id="edit-task-status"
                                value={data.status}
                                onChange={(e) =>
                                    updateField(
                                        'status',
                                        e.target.value as TaskStatus,
                                    )
                                }
                                disabled={processing}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-task-start">Start Date</Label>
                            <Input
                                id="edit-task-start"
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    updateField('start_date', e.target.value)
                                }
                                disabled={processing}
                            />
                            <InputError message={errors.start_date} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-task-due">Due Date</Label>
                            <Input
                                id="edit-task-due"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    updateField('due_date', e.target.value)
                                }
                                disabled={processing}
                            />
                            <InputError message={errors.due_date} />
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Save Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
