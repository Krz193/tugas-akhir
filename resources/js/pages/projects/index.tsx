// Halaman daftar project.

import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, Plus, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ProjectForm from '@/components/projects/project-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuthUser } from '@/hooks/use-auth-user';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project } from '@/types';
import type { AvailableEmployee } from '@/types/project';

// Data dari ProjectController.
type Props = {
    projects: Project[];
    availableEmployees: AvailableEmployee[];
};

// Menentukan warna badge status.
function getStatusVariant(status: Project['status']) {
    if (status === 'active') return 'default' as const;
    if (status === 'planning') return 'secondary' as const;
    if (status === 'completed') return 'outline' as const;
    if (status === 'on_hold') return 'destructive' as const;
    return 'secondary' as const;
}

// Mengubah status menjadi label.
function getStatusLabel(status: Project['status']) {
    const labels = {
        planning: 'Planning',
        active: 'Active',
        completed: 'Completed',
        on_hold: 'On Hold',
    };
    return labels[status];
}

// Mengubah tanggal agar mudah dibaca.
function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Kartu untuk satu project.
function ProjectCard({ project }: { project: Project }) {
    const dueDate = formatDate(project.due_date);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                    <Badge variant={getStatusVariant(project.status)}>
                        {getStatusLabel(project.status)}
                    </Badge>
                    {dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {dueDate}
                        </span>
                    )}
                </div>

                <CardTitle className="text-base">{project.name}</CardTitle>

                {project.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                    </p>
                )}
            </CardHeader>

            <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.members_count ?? 0} members
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-4 w-4 rounded-full border-2 border-current" />
                        {project.tasks_count ?? 0} tasks
                    </span>
                </div>
            </CardContent>

            <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>View Project</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

// Dialog untuk membuat project.
function CreateProjectDialog({
    open,
    onOpenChange,
    availableEmployees,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableEmployees: AvailableEmployee[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        start_date: '',
        due_date: '',
        member_ids: [] as number[],
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/projects', {
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
                    <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ProjectForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        availableEmployees={availableEmployees}
                        submitLabel="Create Project"
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Tampilan saat belum ada project.
function EmptyState({
    canCreate,
    onCreate,
}: {
    canCreate: boolean;
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="rounded-full bg-muted p-6">
                <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
                <p className="font-medium">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {canCreate
                        ? 'Create your first project to get started.'
                        : 'Projects you are a member of will appear here.'}
                </p>
            </div>
            {canCreate && (
                <Button onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    Create Project
                </Button>
            )}
        </div>
    );
}

// Breadcrumb halaman project.
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
];

// Komponen utama daftar project.
export default function ProjectsIndex({ projects, availableEmployees }: Props) {
    const { isProjectManager } = useAuthUser();
    const [createOpen, setCreateOpen] = useState(false);

    const canCreate = isProjectManager();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="flex flex-col gap-6 p-4">
                {/* Header halaman */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Projects</h1>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Button>
                    )}
                </div>

                {/* Daftar project atau kondisi kosong */}
                {projects.length === 0 ? (
                    <EmptyState
                        canCreate={canCreate}
                        onCreate={() => setCreateOpen(true)}
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <CreateProjectDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                availableEmployees={availableEmployees}
            />
        </AppLayout>
    );
}
