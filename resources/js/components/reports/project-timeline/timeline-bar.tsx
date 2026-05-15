import { TimelineTooltip } from './timeline-tooltip';
import { getStatusTone } from './timeline-utils';
import type { TimelinePosition, TimelineProject } from './types';

type TimelineBarProps = {
    project: TimelineProject;
    position: TimelinePosition | null;
    onSelect: (project: TimelineProject) => void;
};

export function TimelineBar({ project, position, onSelect }: TimelineBarProps) {
    if (!position) return null;

    const tone = getStatusTone(project);

    return (
        <button
            type="button"
            onClick={() => onSelect(project)}
            className={`group absolute top-1/2 flex h-9 -translate-y-1/2 items-center rounded-full px-4 text-left text-sm font-medium shadow-lg transition-all duration-200 hover:-translate-y-[52%] hover:shadow-xl ${tone.bar}`}
            style={{
                left: position.left,
                width: position.width,
            }}
        >
            <span className="truncate">{project.name}</span>
            <TimelineTooltip project={project} />
        </button>
    );
}
