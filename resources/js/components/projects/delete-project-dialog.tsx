import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Project } from '@/types';

type DeleteProjectDialogProps = {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({
    project,
    open,
    onOpenChange,
}: DeleteProjectDialogProps) {
    const [deleting, setDeleting] = useState(false);

    if (!project) return null;

    function handleDelete() {
        if (!project) return;

        setDeleting(true);
        router.delete(`/projects/${project.id}`, {
            onFinish: () => {
                setDeleting(false);
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-foreground">
                            &quot;{project.name}&quot;
                        </span>
                        ? This action cannot be undone. All associated tasks,
                        threads, and messages will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting && <Spinner className="mr-2 h-4 w-4" />}
                        Delete Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
