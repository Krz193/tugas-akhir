// pages/projects/show.tsx — Project detail page.
// Shows the project info, its tasks, and its members.

import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ThreadSection } from '@/components/thread/thread-section';
import { Badge } from '@/components/ui/badge';
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
import { useAuthUser } from '@/hooks/use-auth-user';
import AppLayout from '@/layouts/app-layout';
import type {
    AppUser,
    BreadcrumbItem,
    Project,
    Task,
    TaskStatus,
    Message
} from '@/types';

// Props sent by ProjectController::show()
type Props = {
    project: Project & {
        creator: AppUser;
        users: AppUser[]; // project members (excludes creator)
        tasks: Task[];
    };
    assignees: AppUser[]; // creator + members combined, for the task form
    projectThread: Message[];
};

// Formats 'YYYY-MM-DD' → 'Jun 30, 2026'. Returns '—' if null.
function formatDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Returns a Tailwind class string to color-code the status select
function statusSelectClass(status: TaskStatus) {
    if (status === 'done') return 'border-green-300 bg-green-50 text-green-800';
    if (status === 'in_progress')
        return 'border-blue-300 bg-blue-50 text-blue-800';
    return 'border-gray-300 bg-gray-50 text-gray-700';
}

// ------- TaskRow -------
// One row in the task list. Shows status select, title, assignee, due date.
// PM can also delete any task.
function TaskRow({ task, canDelete }: { task: Task; canDelete: boolean }) {
    const { user, isProjectManager } = useAuthUser();

    // Only the assignee or PM can change the status
    const canUpdateStatus = isProjectManager() || task.assigned_to === user.id;

    function handleStatusChange(newStatus: string) {
        router.patch(`/tasks/${task.id}/status`, { status: newStatus });
    }

    function handleDelete() {
        if (window.confirm(`Delete "${task.title}"?`)) {
            router.delete(`/tasks/${task.id}`);
        }
    }

    return (
        <div className="flex items-center gap-3 border-b py-3 last:border-0">
            {/* Status select — colored by current status */}
            <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={!canUpdateStatus}
                className={`rounded-md border px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${statusSelectClass(task.status)}`}
            >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
            </select>

            {/* Task title */}
            <span className="flex-1 text-sm font-medium">{task.title}</span>

            {/* Assignee */}
            <span className="hidden w-32 truncate text-right text-xs text-muted-foreground sm:block">
                {task.assignee?.name ?? '—'}
            </span>

            {/* Due date */}
            <span className="hidden w-24 text-right text-xs text-muted-foreground sm:block">
                {task.due_date ? formatDate(task.due_date) : '—'}
            </span>

            {/* Delete button — PM only */}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete task"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

// ------- CreateTaskDialog -------
// Modal form for PM to add a new task to the project.
function CreateTaskDialog({
    projectId,
    assignees,
    open,
    onOpenChange,
}: {
    projectId: number;
    assignees: AppUser[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        start_date: '',
        due_date: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(`/projects/${projectId}/tasks`, {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Design landing page"
                            disabled={processing}
                        />
                        <InputError message={errors.title} />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-description">Description</Label>
                        <textarea
                            id="task-description"
                            rows={2}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="What needs to be done?"
                            disabled={processing}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Assign to + Priority side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="assigned_to">Assign To</Label>
                            <select
                                id="assigned_to"
                                value={data.assigned_to}
                                onChange={(e) =>
                                    setData('assigned_to', e.target.value)
                                }
                                disabled={processing}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Unassigned</option>
                                {assignees.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.assigned_to} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="priority">Priority</Label>
                            <select
                                id="priority"
                                value={data.priority}
                                onChange={(e) =>
                                    setData('priority', e.target.value)
                                }
                                disabled={processing}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <InputError message={errors.priority} />
                        </div>
                    </div>

                    {/* Dates side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="task-start">Start Date</Label>
                            <Input
                                id="task-start"
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData('start_date', e.target.value)
                                }
                                disabled={processing}
                            />
                            <InputError message={errors.start_date} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="task-due">Due Date</Label>
                            <Input
                                id="task-due"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    setData('due_date', e.target.value)
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
                            Add Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ------- ProjectShow (main page) -------
export default function ProjectShow({ project, assignees, projectThread }: Props) {
    const { isProjectManager } = useAuthUser();
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);

    const isPm = isProjectManager();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.name} />

            <div className="flex flex-col gap-6 p-4">
                {/* ── Project Info ── */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">
                            {project.name}
                        </h1>
                        <Badge
                            variant={
                                project.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {project.status.replace('_', ' ')}
                        </Badge>
                    </div>

                    {/* Dates + creator */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(project.start_date)} →{' '}
                            {formatDate(project.due_date)}
                        </span>
                        <span>Created by {project.creator.name}</span>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {project.description}
                        </p>
                    )}
                </div>

                <div className="space-y-4 rounded-xl border p-6">
                    <div>
                        <h2 className="text-lg font-semibold">Discussion</h2>

                        <p className="text-sm text-muted-foreground">
                            Project-wide discussion thread.
                        </p>
                    </div>

                    <ThreadSection messages={projectThread} messageableType="project" messageableId={project.id} />
                </div>

                {/* ── Tasks ── */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold">
                            Tasks{' '}
                            <span className="font-normal text-muted-foreground">
                                ({project.tasks.length})
                            </span>
                        </h2>
                        {isPm && (
                            <Button
                                size="sm"
                                onClick={() => setTaskDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </Button>
                        )}
                    </div>

                    {project.tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No tasks yet.
                            {isPm ? ' Click "Add Task" to create one.' : ''}
                        </p>
                    ) : (
                        <div className="rounded-lg border">
                            {/* Column headers — hidden on mobile */}
                            <div className="hidden items-center gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                                <span className="w-24">Status</span>
                                <span className="flex-1">Task</span>
                                <span className="w-32 text-right">
                                    Assignee
                                </span>
                                <span className="w-24 text-right">
                                    Due Date
                                </span>
                                {isPm && <span className="w-4" />}
                            </div>

                            <div className="px-3">
                                {project.tasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        canDelete={isPm}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Members ── */}
                <div>
                    <h2 className="mb-3 font-semibold">
                        Members{' '}
                        <span className="font-normal text-muted-foreground">
                            ({project.users.length})
                        </span>
                    </h2>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {project.users.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 rounded-lg border p-3"
                            >
                                {/* Avatar initials */}
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                    {member.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {member.role?.name ?? '—'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {project.users.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No members yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Add Task dialog — PM only */}
            <CreateTaskDialog
                projectId={project.id}
                assignees={assignees}
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
            />
        </AppLayout>
    );
}
