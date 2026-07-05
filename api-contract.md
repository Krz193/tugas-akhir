# API Contract - Djitugo Project Management

Last updated: 2026-05-07 (Asia/Makassar)
Source of truth: `context.md`

## General
- Base auth: all endpoints below require authenticated + verified user.
- Content type: `application/json`.
- Validation failure: `422 Unprocessable Entity` with Laravel validation error format.
- Unauthorized action: `403 Forbidden`.

## Division Lead

### PATCH `/divisions/{division}/lead`
- Route name: `divisions.lead.update`
- Purpose: assign/change division lead (PM only).
- Body:
```json
{
  "lead_user_id": 123
}
```
- Rules:
  - `lead_user_id` nullable
  - user must exist
  - user must belong to same division
  - PM cannot be division lead
  - one user can lead at most one division
- Success: redirect back with session success message.

## PM Transfer

### POST `/pm/transfer`
- Route name: `pm.transfer`
- Purpose: transfer PM role to another user (current PM only).
- Body:
```json
{
  "new_pm_user_id": 456,
  "reason": "handover"
}
```
- Rules:
  - `new_pm_user_id` required, exists, cannot equal current PM user id
  - `reason` nullable string max 2000
- Behavior:
  - transactional role swap
  - creates `pm_transfer_logs` record
- Success: redirect back with session success message.

## Project Management

### GET `/projects`
- Route name: `projects.index`
- Returns project list visible to current user.
- Success:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Project A",
      "description": "...",
      "status": "planning",
      "start_date": "2026-05-01",
      "due_date": "2026-05-20",
      "created_by": 10,
      "tasks_count": 4,
      "users_count": 3
    }
  ]
}
```

### POST `/projects`
- Route name: `projects.store`
- Purpose: create project (PM only).
- Body:
```json
{
  "name": "Project A",
  "description": "Optional",
  "status": "planning",
  "start_date": "2026-05-01",
  "due_date": "2026-05-20"
}
```
- Success: `201`
```json
{ "data": { "id": 1, "name": "Project A", "created_by": 10, "status": "planning" } }
```

### GET `/projects/{project}`
- Route name: `projects.show`
- Returns one project with creator, users, and counts.

### PATCH `/projects/{project}`
- Route name: `projects.update`
- Purpose: update project (creator only).
- Body: any subset of create fields.

### DELETE `/projects/{project}`
- Route name: `projects.destroy`
- Purpose: delete project (creator only).
- Success: `204 No Content`.

### POST `/projects/{project}/members`
- Route name: `projects.members.store`
- Purpose: add member to project (creator only).
- Body:
```json
{ "user_id": 21 }
```
- Success: `201`
```json
{ "data": { "id": 5, "project_id": 1, "user_id": 21, "added_by": 10, "joined_at": "..." } }
```

### DELETE `/projects/{project}/members/{user}`
- Route name: `projects.members.destroy`
- Purpose: remove member (creator only).
- Constraints: project creator cannot be removed.
- Success: `204 No Content`.

## Task Management

### GET `/projects/{project}/tasks`
- Route name: `projects.tasks.index`
- Returns tasks in project (project-visible users only).

### POST `/projects/{project}/tasks`
- Route name: `projects.tasks.store`
- Purpose: create task in project.
- Policy:
  - BD cannot create tasks
  - allowed: PM or project creator based on policy
- Body:
```json
{
  "title": "Implement API",
  "description": "Optional",
  "assigned_to": 21,
  "priority": "medium",
  "start_date": "2026-05-08",
  "due_date": "2026-05-14",
  "position": 0
}
```
- Task status is initialized as `todo`.

### GET `/tasks/{task}`
- Route name: `tasks.show`
- Returns one task with project, assignee, creator.

### PATCH `/tasks/{task}`
- Route name: `tasks.update`
- Purpose: update non-status task fields.

### PATCH `/tasks/{task}/status`
- Route name: `tasks.status.update`
- Purpose: update task status only.
- Body:
```json
{ "status": "in_progress" }
```
- Allowed values: `todo`, `in_progress`, `done`.
- When status = `done`, `completed_at` is set; otherwise cleared.

### DELETE `/tasks/{task}`
- Route name: `tasks.destroy`
- Success: `204 No Content`.

## Threaded Discussion

### GET `/projects/{project}/messages`
- Route name: `projects.messages.index`
- Returns nested message tree for project thread.

### POST `/projects/{project}/messages`
- Route name: `projects.messages.store`
- Body:
```json
{
  "body": "Top-level message",
  "parent_id": null
}
```
- Reply rule: if `parent_id` set, parent must belong to same `messageable_type` and `messageable_id`.

### GET `/tasks/{task}/messages`
- Route name: `tasks.messages.index`
- Returns nested message tree for task thread.

### POST `/tasks/{task}/messages`
- Route name: `tasks.messages.store`
- Same payload/rules as project message creation.

### PATCH `/messages/{message}`
- Route name: `messages.update`
- Purpose: update message body.
- Body:
```json
{ "body": "Edited content" }
```
- Sets `edited_at` timestamp.

### DELETE `/messages/{message}`
- Route name: `messages.destroy`
- Rule: author can delete own message, PM can delete others.
- Success: `204 No Content`.

### Nested Thread Response Shape
Example from thread index:
```json
{
  "data": [
    {
      "id": 1,
      "body": "Parent",
      "user_id": 10,
      "parent_id": null,
      "author": { "id": 10, "name": "User" },
      "replies": [
        {
          "id": 2,
          "body": "Child",
          "user_id": 21,
          "parent_id": 1,
          "author": { "id": 21, "name": "Member" },
          "replies": []
        }
      ]
    }
  ]
}
```

## My Tasks

### GET `/my-tasks`
- Route name: `tasks.my`
- Purpose: tasks assigned to current user.
- Query params:
  - `status`: `todo|in_progress|done`
  - `project_id`: integer
  - `per_page`: `1..100` (default `15`)
- Sorting:
  - due date ascending
  - null due dates last
  - id ascending
- Success: Laravel paginated JSON (`data`, `links`, `meta`) with relations:
  - `project`
  - `creator`
  - `assignee`

## Reporting Contracts

### GET `/reports/timeline`
- Route name: `reports.timeline`
- Query params:
  - `project_id` (optional)
  - `status` (optional)
  - `start_date` (optional)
  - `end_date` (optional)
- Success:
```json
{
  "data": [
    {
      "id": 10,
      "title": "Task",
      "status": "in_progress",
      "due_date": "2026-05-20",
      "project": { "id": 1, "name": "Project" },
      "assignee": { "id": 21, "name": "Member" }
    }
  ],
  "meta": {
    "filters": { "status": "in_progress" },
    "total": 1
  }
}
```

### GET `/reports/calendar`
- Route name: `reports.calendar`
- Query params:
  - `project_id` (optional)
  - `month` (`YYYY-MM`, optional)
- Success grouped by date:
```json
{
  "data": [
    {
      "date": "2026-05-20",
      "tasks": [
        { "id": 10, "title": "Task A" },
        { "id": 11, "title": "Task B" }
      ]
    }
  ],
  "meta": {
    "filters": { "month": "2026-05" },
    "days_with_tasks": 1,
    "total_tasks": 2
  }
}
```

### GET `/reports/performance`
- Route name: `reports.performance`
- Query params:
  - `project_id` (optional)
- Success:
```json
{
  "data": {
    "total_tasks": 10,
    "todo_tasks": 3,
    "in_progress_tasks": 4,
    "done_tasks": 3,
    "overdue_tasks": 2,
    "completion_rate": 30
  },
  "meta": {
    "filters": { "project_id": 1 }
  }
}
```
