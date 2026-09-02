import type { ProjectStatus } from '@/types/models';

export type AvailableEmployee = {
    id: number;
    name: string;
    role?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    division: {
        id: number;
        name: string;
    } | null;
};

export type ProjectFormData = {
    name: string;
    description: string;
    price: string | number;
    status: ProjectStatus;
    start_date: string;
    due_date: string;
    member_ids: number[];
};

