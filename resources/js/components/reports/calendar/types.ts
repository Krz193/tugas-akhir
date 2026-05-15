import type {
    CalendarDay,
    Project,
} from '@/types';

export type Filters = {
    project_id?: number | string;
    month?: string;
};

export type ProjectOption = Pick<
    Project,
    'id' | 'name' | 'status'
>;

export type CalendarReportProps = {
    days: CalendarDay[];
    projects: ProjectOption[];
    filters: Filters;
    daysWithTasks: number;
    totalTasks: number;
};