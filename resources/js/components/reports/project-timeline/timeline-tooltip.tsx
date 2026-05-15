import {
    formatDate,
    getProjectCompletion,
    getStatusTone,
} from './timeline-utils';
import type { TimelineProject } from './types';

type TimelineTooltipProps = {
    project: TimelineProject;
};

export function TimelineTooltip({ project }: TimelineTooltipProps) {
    const tone = getStatusTone(project);

    return (
        <div className="pointer-events-none absolute bottom-12 left-1/2 z-30 hidden w-64 -translate-x-1/2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl group-hover:block">
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="truncate text-sm font-semibold">
                    {project.name}
                </div>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs ${tone.chip}`}
                >
                    {tone.label}
                </span>
            </div>
            <div className="mb-3 text-xs text-muted-foreground">
                {formatDate(project.start_date)} -{' '}
                {formatDate(project.due_date)}
            </div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Task progress</span>
                <span>{getProjectCompletion(project)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className={tone.dot}
                    style={{
                        width: `${getProjectCompletion(project)}%`,
                        height: '100%',
                    }}
                />
            </div>
        </div>
    );
}
