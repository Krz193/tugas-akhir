import { TimelineBar } from './timeline-bar';
import { LABEL_WIDTH, ROW_HEIGHT } from './timeline-utils';
import type { TimelinePosition, TimelineProject, TimelineRange } from './types';

type TimelineRowProps = {
    project: TimelineProject;
    position: TimelinePosition | null;
    range: TimelineRange;
    onSelect: (project: TimelineProject) => void;
};

export function TimelineRow({
    project,
    position,
    range,
    onSelect,
}: TimelineRowProps) {
    return (
        <div
            className="group flex border-b bg-card/60 transition-colors hover:bg-muted/40"
            style={{ height: ROW_HEIGHT }}
        >
            <button
                type="button"
                onClick={() => onSelect(project)}
                className="sticky left-0 z-10 flex shrink-0 items-center border-r bg-card/95 px-4 text-left backdrop-blur"
                style={{ width: LABEL_WIDTH }}
            >
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                        {project.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {project.tasks.length} tasks
                    </div>
                </div>
            </button>

            <div
                className="relative"
                style={{
                    width: range.width,
                    backgroundImage:
                        'linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px)',
                    backgroundSize: `${range.width / 8}px 100%`,
                }}
            >
                <TimelineBar
                    project={project}
                    position={position}
                    onSelect={onSelect}
                />
            </div>
        </div>
    );
}
