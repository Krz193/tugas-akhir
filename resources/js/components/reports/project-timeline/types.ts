import type { TaskStatus } from '@/types';

export type TimelineMember = {
    id: number;
    name: string;
    email: string;
};

export type TimelineThread = {
    id: number;
    body: string;
    created_at: string;
    author: TimelineMember | null;
};

export type TimelineTask = {
    id: number;
    title: string;
    status: TaskStatus;
    start_date: string | null;
    due_date: string | null;
    assignee: TimelineMember | null;
};

export type TimelineProject = {
    id: number;
    name: string;
    status: string;
    start_date: string | null;
    due_date: string | null;
    tasks: TimelineTask[];
    members: TimelineMember[];
    threads: TimelineThread[];
};

export type ProjectFilter = {
    id: number;
    name: string;
};

export type TimelineFilters = {
    project_id?: number | string;
    start_date?: string;
    end_date?: string;
    month?: string;
};

export type TimelineRange = {
    start: Date;
    end: Date;
    months: TimelineMonth[];
    totalDays: number;
    width: number;
};

export type TimelineMonth = {
    label: string;
    start: Date;
    end: Date;
    weeks: TimelineWeek[];
};

export type TimelineWeek = {
    label: string;
    start: Date;
    end: Date;
};

export type TimelinePosition = {
    left: number;
    width: number;
};
