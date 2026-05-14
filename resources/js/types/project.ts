export type AvailableUser = {
    id: number;
    name: string;
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