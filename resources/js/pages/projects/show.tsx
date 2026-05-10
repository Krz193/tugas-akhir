// pages/projects/show.tsx — Project detail page.
// Shows the project info, its tasks, and its members.

import { Head } from '@inertiajs/react';
import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { TaskRow } from '@/components/tasks/task-row';
import { TaskThreadSheet } from '@/components/tasks/task-thread-sheet';
import { ThreadSection } from '@/components/thread/thread-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useTaskThread } from '@/hooks/use-task-thread';
import AppLayout from '@/layouts/app-layout';
import type {
    AppUser,
    BreadcrumbItem,
    Project,
    Task,
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

// ------- ProjectShow (main page) -------
export default function ProjectShow({ project, assignees, projectThread, }: Props) {
    const { isProjectManager } = useAuthUser();
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);

    const {
        selectedTask,
        taskMessages,
        taskSheetOpen,
        loadingTaskMessages,
        setTaskSheetOpen,
        fetchTaskMessages,
        openTaskThread,
    } = useTaskThread();

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

                {/* Project level discussion/sheet */}
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

                            <div className="">
                                {project.tasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        canDelete={isPm}
                                        onClick={() => openTaskThread(task)}
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

            {/* Task level discussion dialog/sheet */}
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
