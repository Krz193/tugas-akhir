import {
    AppDrawer,
    AppDrawerHeader,
    AppDrawerSection,
} from '@/components/ui/drawer/app-drawer';

import type {
    CalendarDay,
    TaskStatus,
} from '@/types';

type CalendarDayDrawerProps = {
    day: CalendarDay | null;
    open: boolean;
    onClose: () => void;
};

const statusOrder: Record<
    TaskStatus,
    number
> = {
    in_progress: 0,
    pending_review: 1,
    todo: 2,
    done: 3,
};

function readableStatus(status: TaskStatus) {
    if (status === 'in_progress') {
        return 'In Progress';
    }

    if (status === 'pending_review') {
        return 'Pending Review';
    }

    if (status === 'done') {
        return 'Done';
    }

    return 'Todo';
}

function statusClass(status: TaskStatus) {
    if (status === 'done') {
        return 'bg-green-500/15 text-green-400 border-green-500/20';
    }

    if (status === 'in_progress') {
        return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    }

    if (status === 'pending_review') {
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    }

    return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        },
    );
}

export function CalendarDayDrawer({
    day,
    open,
    onClose,
}: CalendarDayDrawerProps) {
    const groupedProjects = day
        ? Object.entries(
              day.tasks.reduce(
                  (acc, task) => {
                      const projectName =
                          task.project?.name ??
                          'Unknown Project';

                      if (!acc[projectName]) {
                          acc[projectName] = [];
                      }

                      acc[projectName].push(task);

                      return acc;
                  },
                  {} as Record<
                      string,
                      typeof day.tasks
                  >,
              ),
          )
        : [];

    return (
        <AppDrawer
            open={open}
            onClose={onClose}
        >
            {day && (
                <div className="flex h-full flex-col">
                    <AppDrawerHeader
                        title="Daily Tasks"
                        description={formatDate(
                            day.date,
                        )}
                        onClose={onClose}
                    />

                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        {groupedProjects.map(
                            (
                                [
                                    projectName,
                                    tasks,
                                ],
                            ) => {
                                const sortedTasks =
                                    [...tasks].sort(
                                        (a, b) =>
                                            statusOrder[
                                                a.status
                                            ] -
                                            statusOrder[
                                                b.status
                                            ],
                                    );

                                return (
                                    <AppDrawerSection
                                        key={
                                            projectName
                                        }
                                        title={
                                            projectName
                                        }
                                    >
                                        <div className="space-y-3">
                                            {sortedTasks.map(
                                                (
                                                    task,
                                                ) => (
                                                    <div
                                                        key={
                                                            task.id
                                                        }
                                                        className="rounded-xl border bg-card p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium">
                                                                    {
                                                                        task.title
                                                                    }
                                                                </p>

                                                                {task.assignee && (
                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                        Assigned
                                                                        to{' '}
                                                                        {
                                                                            task
                                                                                .assignee
                                                                                .name
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <span
                                                                className={`
                                                                    rounded-full
                                                                    border
                                                                    px-2.5
                                                                    py-1
                                                                    text-[11px]
                                                                    font-medium
                                                                    whitespace-nowrap
                                                                    ${statusClass(task.status)}
                                                                `}
                                                            >
                                                                {readableStatus(
                                                                    task.status,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </AppDrawerSection>
                                );
                            },
                        )}

                        {day.tasks.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No tasks scheduled for this day.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppDrawer>
    );
}