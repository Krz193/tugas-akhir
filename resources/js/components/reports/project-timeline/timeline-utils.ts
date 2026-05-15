import dayjs from 'dayjs';
import type {
    TimelineMonth,
    TimelinePosition,
    TimelineProject,
    TimelineRange,
    TimelineWeek,
} from './types';

export const WEEK_WIDTH = 160;
export const LABEL_WIDTH = 260;
export const ROW_HEIGHT = 64;
export const TOTAL_WEEKS = 8;
export const TIMELINE_WIDTH = WEEK_WIDTH * TOTAL_WEEKS;

export function formatDate(date: string | null) {
    if (!date) return 'No date';

    return dayjs(date).format('MMM D, YYYY');
}

export function readableStatus(status: string) {
    return status.replace('_', ' ');
}

export function getProjectRange(projects: TimelineProject[]): TimelineRange {
    const starts = projects
        .map((project) => project.start_date)
        .filter(Boolean)
        .map((date) => dayjs(date));

    const start = (
        starts.length > 0
            ? starts.sort((a, b) => a.valueOf() - b.valueOf())[0]
            : dayjs()
    ).startOf('month');
    const secondMonth = start.add(1, 'month').startOf('month');
    const end = secondMonth.endOf('month');

    return {
        start: start.toDate(),
        end: end.toDate(),
        months: [buildMonth(start), buildMonth(secondMonth)],
        totalDays: end.diff(start, 'day') + 1,
        width: TIMELINE_WIDTH,
    };
}

export function getProjectPosition(
    project: TimelineProject,
    range: TimelineRange,
): TimelinePosition | null {
    if (!project.start_date || !project.due_date) return null;

    const rangeStart = dayjs(range.start);
    const rangeEnd = dayjs(range.end);
    const projectStart = dayjs(project.start_date);
    const projectEnd = dayjs(project.due_date);

    if (projectEnd.isBefore(rangeStart) || projectStart.isAfter(rangeEnd)) {
        return null;
    }

    const visibleStart = projectStart.isBefore(rangeStart)
        ? rangeStart
        : projectStart;
    const visibleEnd = projectEnd.isAfter(rangeEnd) ? rangeEnd : projectEnd;
    const leftDays = visibleStart.diff(rangeStart, 'day');
    const durationDays = visibleEnd.diff(visibleStart, 'day') + 1;

    return {
        left: (leftDays / range.totalDays) * range.width,
        width: Math.max(96, (durationDays / range.totalDays) * range.width),
    };
}

export function getProjectCompletion(project: TimelineProject) {
    if (project.tasks.length === 0) return 0;

    const done = project.tasks.filter((task) => task.status === 'done').length;

    return Math.round((done / project.tasks.length) * 100);
}

export function getStatusTone(project: TimelineProject) {
    const status = project.status;
    const dueDate = project.due_date ? dayjs(project.due_date) : null;
    const isOverdue =
        dueDate !== null &&
        dueDate.isBefore(dayjs(), 'day') &&
        getProjectCompletion(project) < 100;

    if (isOverdue) {
        return {
            label: 'Overdue',
            bar: 'bg-red-500/85 text-white shadow-red-950/25 hover:bg-red-500',
            chip: 'bg-red-500/10 text-red-600 dark:text-red-300',
            dot: 'bg-red-500',
        };
    }

    if (status === 'completed' || getProjectCompletion(project) === 100) {
        return {
            label: 'On track',
            bar: 'bg-emerald-500/85 text-white shadow-emerald-950/25 hover:bg-emerald-500',
            chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            dot: 'bg-emerald-500',
        };
    }

    if (status === 'on_hold' || status === 'planning') {
        return {
            label: 'Risk',
            bar: 'bg-amber-400/90 text-amber-950 shadow-amber-950/20 hover:bg-amber-400',
            chip: 'bg-amber-400/10 text-amber-700 dark:text-amber-300',
            dot: 'bg-amber-400',
        };
    }

    return {
        label: 'Active',
        bar: 'bg-blue-500/85 text-white shadow-blue-950/25 hover:bg-blue-500',
        chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500',
    };
}

export function cleanFilters(
    filters: Record<string, string | number | undefined>,
) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== '' && value !== undefined,
        ),
    );
}

function buildMonth(monthStart: dayjs.Dayjs): TimelineMonth {
    const monthEnd = monthStart.endOf('month');

    return {
        label: monthStart.format('MMMM'),
        start: monthStart.toDate(),
        end: monthEnd.toDate(),
        weeks: Array.from({ length: 4 }, (_, index) =>
            buildWeek(monthStart, monthEnd, index),
        ),
    };
}

function buildWeek(
    monthStart: dayjs.Dayjs,
    monthEnd: dayjs.Dayjs,
    index: number,
): TimelineWeek {
    const weekStart = monthStart.add(index * 7, 'day');
    const weekEnd =
        index === 3 ? monthEnd : monthStart.add(index * 7 + 6, 'day');

    return {
        label: `W${index + 1}`,
        start: weekStart.toDate(),
        end: weekEnd.toDate(),
    };
}
