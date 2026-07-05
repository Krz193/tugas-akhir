# Backend Endpoint Guide (Developer Notes)

Last updated: 2026-05-07 (Asia/Makassar)

This document is a code-oriented companion to `api-contract.md`.
Focus: which files are involved, route wiring, and endpoint behavior flow.

## 1) Division Lead

### Endpoint
- `PATCH /divisions/{division}/lead`
- Route name: `divisions.lead.update`

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/DivisionLeadController.php](./app/Http/Controllers/DivisionLeadController.php)
- Request validation: [app/Http/Requests/Division/UpdateDivisionLeadRequest.php](./app/Http/Requests/Division/UpdateDivisionLeadRequest.php)
- Rule: [app/Rules/ValidDivisionLead.php](./app/Rules/ValidDivisionLead.php)
- Policy: [app/Policies/DivisionPolicy.php](./app/Policies/DivisionPolicy.php)
- Model: [app/Models/Division.php](./app/Models/Division.php)

### Behavior
1. Route resolves `division` model.
2. Request `authorize()` checks policy ability `updateLead` (PM only).
3. Rule validates lead candidate:
- exists
- same division
- not PM
- unique lead across divisions
4. Controller updates `lead_user_id` and redirects back with success flash.

## 2) PM Transfer

### Endpoint
- `POST /pm/transfer`
- Route name: `pm.transfer`

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/ProjectManagerTransferController.php](./app/Http/Controllers/ProjectManagerTransferController.php)
- Request: [app/Http/Requests/Admin/TransferProjectManagerRequest.php](./app/Http/Requests/Admin/TransferProjectManagerRequest.php)
- Log model: [app/Models/PmTransferLog.php](./app/Models/PmTransferLog.php)
- Log migration: [database/migrations/2026_05_06_163529_create_pm_transfer_logs_table.php](./database/migrations/2026_05_06_163529_create_pm_transfer_logs_table.php)

### Behavior
1. Request `authorize()` ensures caller is current PM role holder.
2. Request validates `new_pm_user_id` (exists, not self).
3. Controller runs DB transaction with row locks:
- resolve PM role (`project-manager`)
- lock current PM
- lock target user
- unset old PM role
- assign PM role to target
- insert transfer audit log
4. Redirect back with success flash.

## 3) Project Management

### Endpoints
- `GET /projects` (`projects.index`)
- `POST /projects` (`projects.store`)
- `GET /projects/{project}` (`projects.show`)
- `PATCH /projects/{project}` (`projects.update`)
- `DELETE /projects/{project}` (`projects.destroy`)
- `POST /projects/{project}/members` (`projects.members.store`)
- `DELETE /projects/{project}/members/{user}` (`projects.members.destroy`)

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/ProjectController.php](./app/Http/Controllers/ProjectController.php)
- Requests:
  - [app/Http/Requests/Project/StoreProjectRequest.php](./app/Http/Requests/Project/StoreProjectRequest.php)
  - [app/Http/Requests/Project/UpdateProjectRequest.php](./app/Http/Requests/Project/UpdateProjectRequest.php)
  - [app/Http/Requests/Project/AddProjectMemberRequest.php](./app/Http/Requests/Project/AddProjectMemberRequest.php)
- Policy: [app/Policies/ProjectPolicy.php](./app/Policies/ProjectPolicy.php)
- Models:
  - [app/Models/Project.php](./app/Models/Project.php)
  - [app/Models/ProjectMember.php](./app/Models/ProjectMember.php)

### Behavior
- `index`: returns visible projects + counts.
- `store`: PM-only via request authorize; creates project with `created_by` current user.
- `show`: policy `view`; includes creator/users/counts.
- `update`: request authorize `update` (creator only).
- `destroy`: gate `delete`; hard delete.
- `addMember`: request authorize `manageMembers`; inserts pivot row with `added_by` and `joined_at`.
- `removeMember`: gate `manageMembers`; prevents removing project creator.

## 4) Task Management

### Endpoints
- `GET /projects/{project}/tasks` (`projects.tasks.index`)
- `POST /projects/{project}/tasks` (`projects.tasks.store`)
- `GET /tasks/{task}` (`tasks.show`)
- `PATCH /tasks/{task}` (`tasks.update`)
- `PATCH /tasks/{task}/status` (`tasks.status.update`)
- `DELETE /tasks/{task}` (`tasks.destroy`)

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/TaskController.php](./app/Http/Controllers/TaskController.php)
- Requests:
  - [app/Http/Requests/Task/StoreTaskRequest.php](./app/Http/Requests/Task/StoreTaskRequest.php)
  - [app/Http/Requests/Task/UpdateTaskRequest.php](./app/Http/Requests/Task/UpdateTaskRequest.php)
  - [app/Http/Requests/Task/UpdateTaskStatusRequest.php](./app/Http/Requests/Task/UpdateTaskStatusRequest.php)
- Policy: [app/Policies/TaskPolicy.php](./app/Policies/TaskPolicy.php)
- Model: [app/Models/Task.php](./app/Models/Task.php)

### Behavior
- `store`:
  - policy controls creator eligibility (BD blocked by policy)
  - initial status forced to `todo`
- `update`:
  - updates non-status fields only
- `update status`:
  - status restricted to `todo|in_progress|done`
  - `completed_at` auto set/cleared based on status
- assignee validation:
  - assignee must be project creator or project member

## 5) Threaded Discussion (Project/Task)

### Endpoints
- `GET /projects/{project}/messages` (`projects.messages.index`)
- `POST /projects/{project}/messages` (`projects.messages.store`)
- `GET /tasks/{task}/messages` (`tasks.messages.index`)
- `POST /tasks/{task}/messages` (`tasks.messages.store`)
- `PATCH /messages/{message}` (`messages.update`)
- `DELETE /messages/{message}` (`messages.destroy`)

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/MessageController.php](./app/Http/Controllers/MessageController.php)
- Requests:
  - [app/Http/Requests/Message/StoreMessageRequest.php](./app/Http/Requests/Message/StoreMessageRequest.php)
  - [app/Http/Requests/Message/UpdateMessageRequest.php](./app/Http/Requests/Message/UpdateMessageRequest.php)
- Policy: [app/Policies/MessagePolicy.php](./app/Policies/MessagePolicy.php)
- Model: [app/Models/Message.php](./app/Models/Message.php)

### Behavior
- Owner context is polymorphic:
  - project thread -> `messageable_type = Project::class`
  - task thread -> `messageable_type = Task::class`
- `store` validates `parent_id` context:
  - parent must belong to same `messageable_type` + `messageable_id`
- `index` fetches flat records by owner then builds nested `replies[]` tree.
- `update` edits body and stamps `edited_at`.
- `delete` uses policy:
  - author can delete own message
  - PM can delete others

## 6) My Tasks

### Endpoint
- `GET /my-tasks`
- Route name: `tasks.my`

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller method: [app/Http/Controllers/TaskController.php](./app/Http/Controllers/TaskController.php) (`myTasks`)

### Behavior
- always filters by `assigned_to = current user`.
- optional filters:
  - `status`
  - `project_id`
  - `per_page`
- sorting:
  - non-null due date first
  - due date ascending
  - id ascending
- response: Laravel paginator JSON (`data`, `meta`, `links`).

## 7) Reporting Contracts

### Endpoints
- `GET /reports/timeline` (`reports.timeline`)
- `GET /reports/calendar` (`reports.calendar`)
- `GET /reports/performance` (`reports.performance`)

### Files involved
- Route: [routes/web.php](./routes/web.php)
- Controller: [app/Http/Controllers/ReportingController.php](./app/Http/Controllers/ReportingController.php)

### Behavior
- all queries are scoped by `accessibleTaskQuery()`:
  - PM sees all tasks
  - non-PM sees tasks in accessible projects only

#### Timeline
- filtered task list for date range/status/project.
- returns `data[]` + `meta.filters` + `meta.total`.

#### Calendar
- due-date grouped tasks for calendar UI.
- returns `data[]` as `{ date, tasks[] }`.

#### Performance
- aggregate metrics:
  - total, todo, in_progress, done, overdue, completion_rate
- optional project filter.

## Authorization and Gate Wiring

### Files involved
- Policy registration: [app/Providers/AppServiceProvider.php](./app/Providers/AppServiceProvider.php)
- Policies:
  - [app/Policies/ProjectPolicy.php](./app/Policies/ProjectPolicy.php)
  - [app/Policies/TaskPolicy.php](./app/Policies/TaskPolicy.php)
  - [app/Policies/MessagePolicy.php](./app/Policies/MessagePolicy.php)
  - [app/Policies/DivisionPolicy.php](./app/Policies/DivisionPolicy.php)

### Important note
- Base controller in this project does not include `AuthorizesRequests` trait.
- Use `Gate::authorize(...)` or request `authorize()`.

## Test Coverage Map

- Project endpoints: [tests/Feature/ProjectManagementTest.php](./tests/Feature/ProjectManagementTest.php)
- Task endpoints: [tests/Feature/TaskManagementTest.php](./tests/Feature/TaskManagementTest.php)
- Thread endpoints: [tests/Feature/MessageThreadTest.php](./tests/Feature/MessageThreadTest.php)
- My Tasks endpoint: [tests/Feature/MyTaskEndpointTest.php](./tests/Feature/MyTaskEndpointTest.php)
- Reporting endpoints: [tests/Feature/ReportingContractTest.php](./tests/Feature/ReportingContractTest.php)
- PM transfer: [tests/Feature/ProjectManagerTransferTest.php](./tests/Feature/ProjectManagerTransferTest.php)
