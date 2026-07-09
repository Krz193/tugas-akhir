import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, Circle, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import ProjectForm from '@/components/projects/project-form';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskRow } from '@/components/tasks/task-row';
import { TaskThreadSheet } from '@/components/tasks/task-thread-sheet';
import { ThreadSection } from '@/components/thread/thread-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useTaskThread } from '@/hooks/use-task-thread';
import AppLayout from '@/layouts/app-layout';
import type {
    BreadcrumbItem,
    Employee,
    Project,
    ProjectMember,
    ProjectMessage,
    Task,
    TaskStatus,
} from '@/types';
import type { AvailableEmployee, ProjectFormData } from '@/types/project';

// Data dari ProjectController.
type Props = {
    project: Project & {
        members: ProjectMember[];
        tasks: Task[];
    };
    assignees: Employee[];
    projectMessages: ProjectMessage[];
    availableEmployees: AvailableEmployee[];
};

// Mengubah tanggal agar mudah dibaca.
function formatDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function statusLabel(status: TaskStatus) {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'done') return 'Done';
    return 'Todo';
}

function statusColorClass(status: TaskStatus) {
    if (status === 'done') return 'text-green-600';
    if (status === 'in_progress') return 'text-blue-600';
    return 'text-gray-500';
}

function progressColorClass(status: TaskStatus) {
    if (status === 'done') return 'bg-green-500';
    if (status === 'in_progress') return 'bg-blue-500';
    return 'bg-gray-400';
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
    const className = `h-4 w-4 ${statusColorClass(status)}`;

    if (status === 'done') return <CheckCircle2 className={className} />;
    if (status === 'in_progress') return <Clock className={className} />;
    return <Circle className={className} />;
}

function SectionedTaskProgress({ status }: { status: TaskStatus }) {
    const sections: TaskStatus[] = ['todo', 'in_progress', 'done'];
    const activeSectionIndex = sections.indexOf(status);

    return (
        <div className="grid grid-cols-3 gap-0.5">
            {sections.map((section, index) => (
                <div
                    key={section}
                    className={`h-1 rounded-full ${
                        index <= activeSectionIndex
                            ? progressColorClass(status)
                            : 'bg-muted/70'
                    }`}
                />
            ))}
        </div>
    );
}

function MemberTotalProgress({ tasks }: { tasks: Task[] }) {
    const doneTasks = tasks.filter((task) => task.status === 'done').length;
    const totalProgress =
        tasks.length === 0
            ? 0
            : Math.round((doneTasks / tasks.length) * 100);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total progress</span>
                <span>{totalProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${totalProgress}%` }}
                />
            </div>
        </div>
    );
}

// Halaman detail project.
export default function ProjectShow({
    project,
    assignees,
    projectMessages,
    availableEmployees,
}: Props) {
    const { isProjectManager } = useAuthUser();
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);

    const [editOpen, setEditOpen] = useState(false);

    const { data, setData, patch, processing, errors } =
        useForm<ProjectFormData>({
            name: project.name ?? '',
            description: project.description ?? '',
            start_date: project.start_date ?? '',
            due_date: project.due_date ?? '',
            member_ids: project.members.map((member) => member.employee_id),
        });

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

    function openTaskEdit(task: Task) {
        setTaskBeingEdited(task);
        setTaskEditOpen(true);
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const [taskId] = useState(() =>
        new URLSearchParams(window.location.search).get('task'),
    );

    useEffect(() => {
        if (!taskId) return;

        if (!isPm) {
            window.history.replaceState({}, '', `/projects/${project.id}`);
            return;
        }

        const task = project.tasks.find((task) => task.id === Number(taskId));

        if (task) {
            openTaskThread(task);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId, isPm, project.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.name} />

            <div className="flex flex-col gap-6 p-4">
                {/* Informasi project */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
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

                            {project.description && (
                                <p className="text-muted-foreground">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        {isPm && (
                            <Button
                                variant="outline"
                                onClick={() => setEditOpen(true)}
                            >
                                Edit Project
                            </Button>
                        )}
                    </div>

                    {/* Tanggal project */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(project.start_date)} to{' '}
                            {formatDate(project.due_date)}
                        </span>
                    </div>
                </div>

                {/* Diskusi project */}
                <div className="space-y-4 rounded-xl border p-6">
                    <div>
                        <h2 className="text-lg font-semibold">Discussion</h2>

                        <p className="text-sm text-muted-foreground">
                            Project-wide discussion thread.
                        </p>
                    </div>

                    <ThreadSection
                        messages={projectMessages}
                        postUrl={`/projects/${project.id}/messages`}
                        realtimeChannel={`projects.${project.id}`}
                        realtimeEvent=".project.message.sent"
                    />
                </div>

                {/* Daftar task */}
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
                            {/* Judul kolom untuk layar besar */}
                            <div className="hidden items-center gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
                                <span className="w-24">Status</span>
                                <span className="flex-1">Task</span>
                                <span className="w-32 text-right">
                                    Assignee
                                </span>
                                <span className="w-24 text-right">
                                    Due Date
                                </span>
                                {isPm && <span className="w-16" />}
                            </div>

                            <div className="">
                                {project.tasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        canDelete={isPm}
                                        canEdit={isPm}
                                        canOpenDetail={isPm}
                                        onClick={() => {
                                            if (isPm) {
                                                openTaskThread(task);
                                            }
                                        }}
                                        onEdit={() => openTaskEdit(task)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Visualisasi task per anggota */}
                <div>
                    <h2 className="mb-3 font-semibold">
                        Member Task Overview{' '}
                        <span className="font-normal text-muted-foreground">
                            ({project.members.length})
                        </span>
                    </h2>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {project.members.map((member) => {
                            const employee = member.employee;

                            if (!employee) {
                                return null;
                            }

                            const assignedTasks = project.tasks.filter(
                                (task) =>
                                    task.assigned_employee_id ===
                                    member.employee_id,
                            );

                            return (
                                <div
                                    key={`${member.project_id}-${member.employee_id}`}
                                    className="space-y-3 rounded-lg border p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {/* Inisial avatar */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                {employee.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium leading-tight">
                                                    {employee.name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {employee.division?.name ??
                                                        'No Division'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-base font-semibold leading-tight">
                                                {assignedTasks.length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                tasks
                                            </p>
                                        </div>
                                    </div>

                                    <MemberTotalProgress
                                        tasks={assignedTasks}
                                    />

                                    <div className="space-y-2">
                                        {assignedTasks.length === 0 ? (
                                            <p className="rounded-md border border-dashed p-2 text-xs text-muted-foreground">
                                                No assigned tasks.
                                            </p>
                                        ) : (
                                            assignedTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="space-y-1.5 border-t pt-2 first:border-t-0 first:pt-0"
                                                >
                                                    <div className="flex items-start gap-1.5">
                                                        <TaskStatusIcon
                                                            status={task.status}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">
                                                                {task.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {statusLabel(
                                                                    task.status,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <SectionedTaskProgress
                                                        status={task.status}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {project.members.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No members yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Dialog tambah task */}
            <CreateTaskDialog
                projectId={project.id}
                assignees={assignees}
                open={taskDialogOpen}
                onOpenChange={setTaskDialogOpen}
            />

            {/* Dialog edit task */}
            <EditTaskDialog
                task={taskBeingEdited}
                assignees={assignees}
                open={taskEditOpen}
                onOpenChange={setTaskEditOpen}
            />

            {/* Diskusi task */}
            <TaskThreadSheet
                task={selectedTask}
                messages={taskMessages}
                open={taskSheetOpen}
                loading={loadingTaskMessages}
                onOpenChange={(open) => {
                    setTaskSheetOpen(open);

                    if (!open) {
                        window.history.replaceState(
                            {},
                            '',
                            `/projects/${project.id}`,
                        );
                    }
                }}
                onMessageSent={() => {
                    if (selectedTask) {
                        fetchTaskMessages(selectedTask.id);
                    }
                }}
            />

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            patch(`/projects/${project.id}`, {
                                onSuccess: () => {
                                    setEditOpen(false);
                                },
                            });
                        }}
                    >
                        <ProjectForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            availableEmployees={availableEmployees}
                            submitLabel="Save Changes"
                        />
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
