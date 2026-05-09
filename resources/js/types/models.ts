// models.ts — TypeScript types for every object returned by the backend.
// Each type matches a database table. Import from '@/types' anywhere in the app.

// Role & Division
export type Role = {
    id: number;
    name: string;
    slug: string; // 'project-manager' | 'business-developer' | 'team-member'
};

export type Division = {
    id: number;
    name: string;
    lead_user_id: number | null;
};

// User (the richer version used inside project/task context)
export type AppUser = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: Role;
    division: Division;
    created_at: string;
    updated_at: string;
};

// Project
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export type Project = {
    id: number;
    name: string;
    description: string | null;
    status: ProjectStatus;
    start_date: string | null;
    due_date: string | null;
    created_by: number;
    creator?: AppUser; // only present when backend eager-loads it
    members?: AppUser[]; // only present when backend eager-loads it
    tasks_count?: number; // added by withCount('tasks')
    users_count?: number; // added by withCount('users')
    created_at: string;
    updated_at: string;
};

// Task
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigned_to: number | null;
    created_by: number;
    due_date: string | null;
    project?: Project; // only present when backend eager-loads it
    assignee?: AppUser; // only present when backend eager-loads it
    creator?: AppUser; // only present when backend eager-loads it
    created_at: string;
    updated_at: string;
};

// Message (threaded discussion)
// Can belong to a Project or a Task via polymorphic relation.
export type Message = {
    id: number;
    body: string;
    author_id: number;
    author?: AppUser;
    parent_id: number | null; // null = top-level, number = reply to another message
    replies?: Message[]; // only on top-level messages
    messageable_type: string; // 'App\\Models\\Project' or 'App\\Models\\Task'
    messageable_id: number;
    created_at: string;
    updated_at: string;
};

// Pagination wrapper — used when the backend returns a paginated list
export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

// Report types

export type CalendarDay = {
    date: string; // 'YYYY-MM-DD'
    tasks: Task[];
};

export type PerformanceMetrics = {
    total_tasks: number;
    todo_tasks: number;
    in_progress_tasks: number;
    done_tasks: number;
    overdue_tasks: number;
    completion_rate: number; // 0–100
};
