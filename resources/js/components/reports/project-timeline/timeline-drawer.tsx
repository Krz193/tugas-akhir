import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
    formatDate,
    getProjectCompletion,
    getStatusTone,
    readableStatus,
} from './timeline-utils';
import type { TimelineProject } from './types';

type TimelineDrawerProps = {
    project: TimelineProject | null;
    open: boolean;
    onClose: () => void;
};

export function TimelineDrawer({
    project,
    open,
    onClose,
}: TimelineDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!open) return;
            if (
                drawerRef.current &&
                !drawerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);

        return () =>
            document.removeEventListener('pointerdown', handlePointerDown);
    }, [onClose, open]);

    const tone = project ? getStatusTone(project) : null;
    const completion = project ? getProjectCompletion(project) : 0;

    return (
        <div
            className={`fixed inset-0 z-40 transition ${
                open ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
        >
            <div
                className={`absolute inset-0 bg-background/40 transition-opacity ${
                    open ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <div
                ref={drawerRef}
                className={`absolute top-0 right-0 h-full w-full max-w-md border-l bg-background shadow-2xl transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {project && tone ? (
                    <div className="flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4 border-b p-6">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {project.name}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {formatDate(project.start_date)} -{' '}
                                    {formatDate(project.due_date)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                            <section className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Project detail
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${tone.chip}`}
                                    >
                                        {tone.label}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Status: {readableStatus(project.status)}
                                </div>
                            </section>

                            <section>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="font-medium">
                                        Task progress
                                    </span>
                                    <span className="text-muted-foreground">
                                        {completion}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={tone.dot}
                                        style={{
                                            width: `${completion}%`,
                                            height: '100%',
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-3 text-sm font-medium">
                                    Milestones
                                </h3>
                                <div className="space-y-3">
                                    {project.tasks.slice(0, 5).map((task) => (
                                        <div
                                            key={task.id}
                                            className="rounded-lg border bg-card p-3"
                                        >
                                            <div className="text-sm font-medium">
                                                {task.title}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {readableStatus(task.status)} ·{' '}
                                                {formatDate(task.due_date)}
                                            </div>
                                        </div>
                                    ))}
                                    {project.tasks.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No milestones yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-3 text-sm font-medium">
                                    Related threads
                                </h3>
                                <div className="space-y-3">
                                    {project.threads
                                        .slice(0, 3)
                                        .map((thread) => (
                                            <div
                                                key={thread.id}
                                                className="rounded-lg border bg-card p-3"
                                            >
                                                <div className="line-clamp-2 text-sm">
                                                    {thread.body}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {thread.author?.name ??
                                                        'Unknown author'}
                                                </div>
                                            </div>
                                        ))}
                                    {project.threads.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No related threads yet.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-3 text-sm font-medium">
                                    Recent activity
                                </h3>
                                <div className="space-y-3 text-sm text-muted-foreground">
                                    {project.tasks.slice(0, 3).map((task) => (
                                        <div key={task.id}>
                                            {task.assignee?.name ??
                                                'Unassigned'}{' '}
                                            is handling {task.title}
                                        </div>
                                    ))}
                                    {project.tasks.length === 0 && (
                                        <div>No recent activity.</div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-3 text-sm font-medium">
                                    Assigned members
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.members.map((member) => (
                                        <span
                                            key={member.id}
                                            className="rounded-full bg-muted px-3 py-1 text-xs"
                                        >
                                            {member.name}
                                        </span>
                                    ))}
                                    {project.members.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No assigned members.
                                        </p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
