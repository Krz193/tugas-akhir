// =============================================================================
// pages/projects/index.tsx — Projects list page
//
// What this page does:
//   1. Shows all projects the current user has access to (as cards)
//   2. PM gets a "Create Project" button that opens a dialog
//   3. Each card links to the project detail page (not built yet)
//
// Data flow:
//   Laravel (ProjectController::index) → Inertia → this page (via `projects` prop)
//   Create form → POST /projects → redirect back → page re-renders with new data
// =============================================================================

import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, Plus, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser } from '@/hooks/use-auth-user';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project } from '@/types';

// -----------------------------------------------------------------------------
// Types
// The backend passes projects with task and user counts added via withCount().
// -----------------------------------------------------------------------------

type ProjectWithCounts = Project & {
    tasks_count: number;
    users_count: number;
};

type Props = {
    projects: ProjectWithCounts[];
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Maps a project status string to the correct Badge variant.
 * Badge variants available: default (blue), secondary (gray),
 * destructive (red), outline (bordered).
 */
function getStatusVariant(status: Project['status']) {
    switch (status) {
        case 'active':
            return 'default' as const;
        case 'planning':
            return 'secondary' as const;
        case 'completed':
            return 'outline' as const;
        case 'on_hold':
            return 'destructive' as const;
    }
}

/**
 * Converts a status slug into a human-readable label.
 * e.g. "on_hold" → "On Hold"
 */
function getStatusLabel(status: Project['status']) {
    const labels: Record<Project['status'], string> = {
        planning: 'Planning',
        active: 'Active',
        completed: 'Completed',
        on_hold: 'On Hold',
    };
    return labels[status];
}

/**
 * Formats an ISO date string (e.g. "2026-06-30") into a readable form
 * (e.g. "Jun 30, 2026"). Returns null if no date is provided.
 */
function formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// -----------------------------------------------------------------------------
// ProjectCard — displays a single project as a card
// -----------------------------------------------------------------------------

function ProjectCard({ project }: { project: ProjectWithCounts }) {
    const formattedDueDate = formatDate(project.due_date);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="gap-3">
                {/* Status badge + due date row */}
                <div className="flex items-center justify-between">
                    <Badge variant={getStatusVariant(project.status)}>
                        {getStatusLabel(project.status)}
                    </Badge>
                    {formattedDueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {formattedDueDate}
                        </span>
                    )}
                </div>

                {/* Project name */}
                <CardTitle className="text-base">{project.name}</CardTitle>

                {/* Description — clamped to 2 lines */}
                {project.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                    </p>
                )}
            </CardHeader>

            <CardContent>
                {/* Member and task counts */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.users_count} member
                        {project.users_count !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                        {/* simple circle indicator */}
                        <span className="h-4 w-4 rounded-full border-2 border-current" />
                        {project.tasks_count} task
                        {project.tasks_count !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardContent>

            <CardFooter>
                {/* Link to the project detail page (show page — built next) */}
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>View Project</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

// -----------------------------------------------------------------------------
// CreateProjectDialog — modal form for PM to create a new project
// -----------------------------------------------------------------------------

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
    // useForm from Inertia handles:
    //   - field values (data)
    //   - server-side validation errors (errors)
    //   - loading state while submitting (processing)
    //   - resetting fields (reset)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        start_date: '',
        due_date: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        // POST /projects → backend creates the project → redirects to /projects
        // Inertia follows the redirect and the page re-renders with new data.
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Project Name */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">
                            Project Name{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Website Redesign"
                            disabled={processing}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        {/*
                         * No <Textarea> component exists yet, so we style a plain
                         * <textarea> to match the Input component's appearance.
                         */}
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="What is this project about?"
                            disabled={processing}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Date fields side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
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
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input
                                id="due_date"
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
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// -----------------------------------------------------------------------------
// EmptyState — shown when the user has no projects yet
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// ProjectsIndex — main page component (default export)
// Inertia renders this when the user visits GET /projects
// -----------------------------------------------------------------------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
];

export default function ProjectsIndex({ projects }: Props) {
    const { isProjectManager } = useAuthUser();
    const [createOpen, setCreateOpen] = useState(false);

    const canCreate = isProjectManager();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="flex flex-col gap-6 p-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Projects</h1>

                    {/* Only PMs see the create button */}
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Button>
                    )}
                </div>

                {/* Content: either the card grid or the empty state */}
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

            {/* Create project dialog — only mounted when PM opens it */}
            <CreateProjectDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </AppLayout>
    );
}
