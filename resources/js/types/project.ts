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
    start_date: string;
    due_date: string;
    member_ids: number[];
};
