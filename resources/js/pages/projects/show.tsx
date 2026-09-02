import { Head, router, useForm } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    CheckCircle2,
    Clock,
    Circle,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { DeleteProjectDialog } from '@/components/projects/delete-project-dialog';
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

function formatCurrency(amount: number | string | null | undefined) {
    if (amount === null || amount === undefined || amount === '') return null;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return null;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num);
}

function statusLabel(status: TaskStatus) {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'done') return 'Done';
    return 'Todo';
}

function statusColorClass(status: TaskStatus) {
    if (status === 'done') return 'text-green-600';
    if (status === 'in_progress') return 'text-blue-600';
    return 'text-rose-500';
}

function progressColorClass(status: TaskStatus) {
    if (status === 'done') return 'bg-green-500';
    if (status === 'in_progress') return 'bg-blue-500';
    return 'bg-rose-400';
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
    const { user, isProjectManager, isTeamMember } = useAuthUser();
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [taskEditOpen, setTaskEditOpen] = useState(false);
    const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, patch, processing, errors } =
        useForm<ProjectFormData>({
            name: project.name ?? '',
            description: project.description ?? '',
            price: project.price ?? '',
            status: project.status,
            start_date: project.start_date ?? '',
            due_date: project.due_date ?? '',
            member_ids: project.members.map((member) => member.employee_id),
        });

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            name: project.name ?? '',
            description: project.description ?? '',
            price: project.price ?? '',
            status: project.status,
            start_date: project.start_date ?? '',
            due_date: project.due_date ?? '',
            member_ids: project.members.map((member) => member.employee_id),
        }));
    }, [project]);

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
    const employeeId = user.employee?.id;

    function canAccessTaskThread(task: Task) {
        return (
            isPm ||
            (isTeamMember() && task.assigned_employee_id === employeeId)
        );
    }

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

    const totalTasksCount = project.tasks_count ?? project.tasks.length;
    const todoTasksCount =
        project.todo_tasks_count ??
        project.tasks.filter((task) => task.status === 'todo').length;
    const inProgressTasksCount =
        project.in_progress_tasks_count ??
        project.tasks.filter((task) => task.status === 'in_progress').length;
    const doneTasksCount =
        project.done_tasks_count ??
        project.tasks.filter((task) => task.status === 'done').length;
    const formattedPrice = formatCurrency(project.price);

    useEffect(() => {
        if (!taskId) return;

        const task = project.tasks.find((task) => task.id === Number(taskId));

        if (task && canAccessTaskThread(task)) {
            openTaskThread(task);
        } else {
            window.history.replaceState({}, '', `/projects/${project.id}`);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskId, isPm, project.id, employeeId]);

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

                                {isPm ? (
                                    <select
                                        value={project.status}
                                        onChange={(e) => {
                                            router.patch(
                                                `/projects/${project.id}`,
                                                { status: e.target.value },
                                                { preserveScroll: true },
                                            );
                                        }}
                                        className="h-7 cursor-pointer rounded-md border bg-background px-2 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        title="Change Project Status"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                ) : (
                                    <Badge
                                        variant={
                                            project.status === 'active'
                                                ? 'default'
                                                : project.status === 'completed'
                                                  ? 'outline'
                                                  : project.status === 'on_hold'
                                                    ? 'destructive'
                                                    : 'secondary'
                                        }
                                    >
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                )}
                            </div>

                            {project.description && (
                                <p className="text-muted-foreground">
                                    {project.description}
                                </p>
                            )}

                            <div className="mt-4 max-w-xs">
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">
                                        {project.progress_percentage !== null && project.progress_percentage !== undefined
                                            ? `${project.progress_percentage}%`
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                                        style={{
                                            width:
                                                project.progress_percentage !== null && project.progress_percentage !== undefined
                                                    ? `${project.progress_percentage}%`
                                                    : '0%',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {isPm && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditOpen(true)}
                                >
                                    Edit Project
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Project
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tanggal & Nilai project */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(project.start_date)} to{' '}
                            {formatDate(project.due_date)}
                        </span>
                        {formattedPrice && (
                            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                <Banknote className="h-4 w-4" />
                                {formattedPrice}
                            </span>
                        )}
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
                        canSend={!isTeamMember()}
                    />
                </div>

                {/* Daftar task */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-lg">
                            Tasks{' '}
                            <span className="font-normal text-muted-foreground text-sm">
                                ({totalTasksCount})
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

                    {/* Ringkasan status task */}
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="text-xs font-medium text-muted-foreground">
                                Total Tasks
                            </div>
                            <div className="mt-1 text-2xl font-bold">
                                {totalTasksCount}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <span>To Do</span>
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                            </div>
                            <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {todoTasksCount}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <span>In Progress</span>
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                            </div>
                            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {inProgressTasksCount}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-3 shadow-xs">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <span>Done</span>
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                            </div>
                            <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                                {doneTasksCount}
                            </div>
                        </div>
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
                                        canOpenDetail={canAccessTaskThread(task)}
                                        onClick={() => {
                                            if (canAccessTaskThread(task)) {
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

            <DeleteProjectDialog
                project={project}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </AppLayout>
    );
}
