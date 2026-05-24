import {
    AppDrawer,
    AppDrawerHeader,
    AppDrawerSection,
} from '@/components/ui/drawer/app-drawer';

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
    const tone = project
        ? getStatusTone(project)
        : null;

    const completion = project
        ? getProjectCompletion(project)
        : 0;

    return (
        <AppDrawer
            open={open}
            onClose={onClose}
        >
            {project && tone ? (
                <div className="flex h-full flex-col">
                    <AppDrawerHeader
                        title={project.name}
                        description={`${formatDate(project.start_date)} - ${formatDate(project.due_date)}`}
                        onClose={onClose}
                    />

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
                                Status:{' '}
                                {readableStatus(
                                    project.status,
                                )}
                            </div>
                        </section>

                        <AppDrawerSection title="Task progress">
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium">
                                    Completion
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
                        </AppDrawerSection>

                        <AppDrawerSection title="Milestones">
                            <div className="space-y-3">
                                {project.tasks
                                    .slice(0, 5)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            className="rounded-lg border bg-card p-3"
                                        >
                                            <div className="text-sm font-medium">
                                                {task.title}
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {readableStatus(
                                                    task.status,
                                                )}{' '}
                                                ·{' '}
                                                {formatDate(
                                                    task.due_date,
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {/* empty state */}
                                {project.tasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No milestones yet.
                                    </p>
                                )}
                            </div>
                        </AppDrawerSection>

                        <AppDrawerSection title="Related threads">
                            <div className="space-y-3">
                                {project.threads
                                    .slice(0, 3)
                                    .map((thread) => (
                                        <div
                                            key={thread.id}
                                            className="rounded-lg border bg-card p-3"
                                        >
                                            <div className="line-clamp-2 text-sm">
                                                {
                                                    thread.body
                                                }
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {thread.author
                                                    ?.name ??
                                                    'Unknown author'}
                                            </div>
                                        </div>
                                    ))}

                                {project.threads.length ===
                                    0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No related threads yet.
                                    </p>
                                )}
                            </div>
                        </AppDrawerSection>

                        <AppDrawerSection title="Recent activity">
                            <div className="space-y-3 text-sm text-muted-foreground">
                                {project.tasks
                                    .slice(0, 3)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                        >
                                            {task.assignee
                                                ?.name ??
                                                'Unassigned'}{' '}
                                            is handling{' '}
                                            {
                                                task.title
                                            }
                                        </div>
                                    ))}

                                {project.tasks.length ===
                                    0 && (
                                    <div>
                                        No recent activity.
                                    </div>
                                )}
                            </div>
                        </AppDrawerSection>

                        <AppDrawerSection title="Assigned members">
                            <div className="flex flex-wrap gap-2">
                                {project.members.map(
                                    (member) => (
                                        <span
                                            key={
                                                member.id
                                            }
                                            className="rounded-full bg-muted px-3 py-1 text-xs"
                                        >
                                            {
                                                member.name
                                            }
                                        </span>
                                    ),
                                )}

                                {project.members.length ===
                                    0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No assigned
                                        members.
                                    </p>
                                )}
                            </div>
                        </AppDrawerSection>
                    </div>
                </div>
            ) : null}
        </AppDrawer>
    );
}