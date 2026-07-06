// Tipe data yang dikirim dari backend.

// Role dan division.
export type Role = {
    id: number;
    name: string;
    slug: string; // contoh: project-manager
};

export type Division = {
    id: number;
    name: string;
};

export type Employee = {
    id: number;
    user_id: number;
    role_id: number;
    division_id: number | null;
    name: string;
    phone?: string | null;
    address?: string | null;
    role?: Role | null;
    division?: Division | null;
    created_at: string;
    updated_at: string;
};

export type AppUser = {
    id: number;
    email: string;
    email_verified_at: string | null;
    employee?: Employee | null;
    created_at: string;
    updated_at: string;
};

export type ProjectMember = {
    id: number;
    project_id: number;
    employee_id: number;
    date_joined: string;
    is_leader: boolean;
    employee?: Employee | null;
    created_at: string;
    updated_at: string;
};

// Project.
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export type Project = {
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
    start_date: string | null;
    due_date: string | null;
    members?: ProjectMember[];
    tasks?: Task[];
    project_messages?: ProjectMessage[];
    tasks_count?: number;
    members_count?: number;
    created_at: string;
    updated_at: string;
};

// Task.
export type TaskStatus = 'todo' | 'in_progress' | 'pending_review' | 'done';

export type Task = {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigned_employee_id: number | null;
    start_date: string | null;
    due_date: string | null;
    project?: Project;
    assignee?: Employee | null;
    thread?: Thread | null;
    created_at: string;
    updated_at: string;
};

export type Thread = {
    id: number;
    task_id: number;
    messages?: Message[];
    created_at: string;
    updated_at: string;
};

export type Message = {
    id: number;
    thread_id: number;
    sender_id: number;
    message_body: string;
    sender?: Employee | null;
    created_at: string;
    updated_at: string;
};

export type ProjectMessage = {
    id: number;
    project_id: number;
    sender_id: number;
    message_body: string;
    sender?: Employee | null;
    created_at: string;
    updated_at: string;
};

// Data untuk hasil paginasi.
export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type CalendarDay = {
    date: string; // format YYYY-MM-DD
    tasks: Task[];
};
