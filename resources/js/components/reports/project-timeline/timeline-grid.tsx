import { TimelineRow } from './timeline-row';
import { getProjectPosition, LABEL_WIDTH } from './timeline-utils';
import type { TimelineProject, TimelineRange } from './types';

type TimelineGridProps = {
    projects: TimelineProject[];
    range: TimelineRange;
    onSelect: (project: TimelineProject) => void;
};

export function TimelineGrid({ projects, range, onSelect }: TimelineGridProps) {
    return (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <div
                className="min-w-max"
                style={{ width: LABEL_WIDTH + range.width }}
            >
                <div className="sticky top-0 z-20 flex border-b bg-card/95 backdrop-blur">
                    <div
                        className="sticky left-0 z-30 shrink-0 border-r bg-card px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                        style={{ width: LABEL_WIDTH }}
                    >
                        Projects
                    </div>

                    <div className="flex" style={{ width: range.width }}>
                        {range.months.map((month) => (
                            <div
                                key={month.label}
                                className="border-r last:border-r-0"
                                style={{ width: range.width / 2 }}
                            >
                                <div className="border-b px-4 py-2 text-sm font-medium">
                                    {month.label}
                                </div>
                                <div className="grid grid-cols-4">
                                    {month.weeks.map((week) => (
                                        <div
                                            key={`${month.label}-${week.label}`}
                                            className="border-r py-2 text-center text-xs text-muted-foreground last:border-r-0"
                                        >
                                            {week.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No project timeline data found.
                    </div>
                ) : (
                    projects.map((project) => (
                        <TimelineRow
                            key={project.id}
                            project={project}
                            position={getProjectPosition(project, range)}
                            range={range}
                            onSelect={onSelect}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
