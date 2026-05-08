// =============================================================================
// models.ts — Shape of every object returned by the backend API
//
// Each "type" here maps directly to a database table or API response object.
// When the backend sends JSON, TypeScript uses these to know what fields exist.
// =============================================================================

// -----------------------------------------------------------------------------
// Role & Division
// A Role is "project-manager", "business-developer", or "team-member".
// A Division is the department a user belongs to (e.g. "Engineering").
// -----------------------------------------------------------------------------

export type Role = {
    id: number;
    name: string;
    slug: string; // e.g. "project-manager" | "business-developer" | "team-member"
};

export type Division = {
    id: number;
    name: string;
    lead_user_id: number | null; // nullable: division may not have a lead yet
};

// -----------------------------------------------------------------------------
// User
// Extends the base User in auth.ts with role and division relations.
// The base User is kept in auth.ts for auth/session concerns.
// This richer version is used when displaying users in project/task context.
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Project
// A project is created by a PM and has members.
// "members" is only present when the backend eager-loads them (e.g. show page).
// -----------------------------------------------------------------------------

export type Project = {
    id: number;
    name: string;
    description: string | null;
    created_by: number;       // user id of the PM who created it
    creator?: AppUser;        // eager-loaded creator object (optional)
    members?: AppUser[];      // eager-loaded member list (optional)
    tasks_count?: number;     // optional aggregate from backend
    created_at: string;
    updated_at: string;
};

// -----------------------------------------------------------------------------
// Task
// Tasks live inside a project and are assigned to one user.
// Status is one of three fixed values — no others are allowed.
// -----------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigned_to: number | null;   // user id, nullable if unassigned
    created_by: number;
    due_date: string | null;      // ISO date string e.g. "2025-08-01"
    project?: Project;            // eager-loaded (optional)
    assignee?: AppUser;           // eager-loaded (optional)
    creator?: AppUser;            // eager-loaded (optional)
    created_at: string;
    updated_at: string;
};

// -----------------------------------------------------------------------------
// Message (Threaded Discussion)
// Messages use a polymorphic owner: they can belong to a Project or a Task.
// "replies" is the nested list of child messages under a parent message.
// -----------------------------------------------------------------------------

export type Message = {
    id: number;
    body: string;
    author_id: number;
    author?: AppUser;             // eager-loaded (optional)
    parent_id: number | null;     // null = top-level message; number = reply
    replies?: Message[];          // nested replies (only on top-level messages)
    messageable_type: string;     // "App\\Models\\Project" or "App\\Models\\Task"
    messageable_id: number;
    created_at: string;
    updated_at: string;
};

// -----------------------------------------------------------------------------
// Pagination
// Laravel paginates responses using this structure.
// "T" is a generic — it means "a paginated list of anything" (Task, Project, etc.)
// -----------------------------------------------------------------------------

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

// -----------------------------------------------------------------------------
// Report types
// Used by the Timeline, Calendar, and Performance report endpoints.
// -----------------------------------------------------------------------------

// Timeline: list of tasks with date range for Gantt-style display
export type TimelineTask = Task; // same shape, just filtered/sorted differently

// Calendar: tasks grouped by their due date
export type CalendarDay = {
    date: string;     // "YYYY-MM-DD"
    tasks: Task[];
};

// Performance: aggregate metrics for a project
export type PerformanceMetrics = {
    total_tasks: number;
    todo_tasks: number;
    in_progress_tasks: number;
    done_tasks: number;
    overdue_tasks: number;
    completion_rate: number; // 0–100 (percentage)
};
