# Project Progress Snapshot

Last updated: 2026-05-25 (Asia/Makassar)
Source of truth: [context.md](./context.md)

## Objective
Build Djitugo Project Management System prototype with:
- project/task management
- threaded discussion (polymorphic owner + nested replies)
- role-aware collaboration (PM, BD, Team Member)

---

## Completed

### 1) Database foundation
- `roles`, `divisions`, `projects`, `tasks`, `project_members`, `attachments`, `messages`
- `users` linked to `role_id` and `division_id`
- `messages` uses polymorphic owner (`messageable_type`, `messageable_id`) + `parent_id`

### 2) Eloquent model structure
- Models and relationships for all core entities are in place.
- Message relationships aligned with polymorphic architecture:
  `Message::messageable()`, `Project::messages()` morphMany, `Task::messages()` morphMany

### 3) Access control baseline
- Policies: `ProjectPolicy`, `TaskPolicy`, `MessagePolicy`, `DivisionPolicy`
- Middleware aliases: `project.access`, `task.access`, `message.access`
- User helper methods for role and membership checks.

### 4) Division lead feature
- Added `divisions.lead_user_id` (nullable, unique FK to users).
- Validation rule `ValidDivisionLead` (must be same division, not PM).
- Endpoint: `PATCH /divisions/{division}/lead`

### 5) PM transfer + audit
- Endpoint: `POST /pm/transfer`
- Transactional PM handover with row locking.
- Audit table/model: `pm_transfer_logs`
- Feature tests: `ProjectManagerTransferTest`

### 6) Project management endpoints
- `GET/POST /projects`, `GET/PATCH/DELETE /projects/{project}`
- `POST /projects/{project}/members`, `DELETE /projects/{project}/members/{user}`
- Request validations: `StoreProjectRequest`, `UpdateProjectRequest`, `AddProjectMemberRequest`
- Feature tests: `ProjectManagementTest`

### 7) Task management endpoints
- `GET/POST /projects/{project}/tasks`, `GET/PATCH/DELETE /tasks/{task}`, `PATCH /tasks/{task}/status`
- Request validations: `StoreTaskRequest`, `UpdateTaskRequest`, `UpdateTaskStatusRequest`
- Business rules:
  - Task statuses: `todo`, `in_progress`, `pending_review`, `done`
  - BD cannot create tasks
  - Regular members cannot directly set tasks to `done`
  - `pending_review` and `done` states are locked for regular members
- Feature tests: `TaskManagementTest`

### 8) Threaded discussion endpoints
- `GET/POST /projects/{project}/messages`, `GET/POST /tasks/{task}/messages`, `PATCH/DELETE /messages/{message}`
- Request validations: `StoreMessageRequest`, `UpdateMessageRequest`
- Business rules: reply parent must match owner context, PM can delete others' messages
- Response returns nested tree via `replies[]`
- Feature tests: `MessageThreadTest`

### 9) My Tasks endpoint
- `GET /my-tasks` — filters: `status`, `project_id`, `per_page` (default 15)
- Sorted by due date (null last), paginated
- Feature tests: `MyTaskEndpointTest`

### 10) Timeline / Calendar / Performance reporting endpoints
- `GET /reports/timeline`, `GET /reports/calendar`, `GET /reports/performance`
- PM sees all; non-PM scoped to accessible projects
- Feature tests: `ReportingContractTest`

### 11) Database seeders
- `RoleSeeder`, `DivisionSeeder`, `UserSeeder`, `ProjectSeeder`, `TaskSeeder`, `MessageSeeder`
- `DatabaseSeeder` calls all in dependency order
- `UserFactory` updated with `role_id`/`division_id` + state methods: `projectManager()`, `businessDeveloper()`, `teamMember()`
- Run with: `php artisan migrate:fresh --seed`
- Login accounts (password is always `password`):
  - `pm@djitugo.test` → Project Manager, Engineering (Andi Pratama)
  - `bd@djitugo.test` → Business Developer, Marketing (Budi Santoso)
  - `member1@djitugo.test` → Team Member, Engineering (Citra Dewi)
  - `member2@djitugo.test` → Team Member, Design (Deni Firmansyah)
  - `member3@djitugo.test` → Team Member, Marketing (Eko Nugroho)

### 12) Frontend foundation (TypeScript + layout)
- `types/models.ts` — shapes for all entities: `Role`, `Division`, `AppUser`, `Project`, `Task`, `Message`, `PaginatedResponse<T>`, `CalendarDay`, `PerformanceMetrics`
- `types/auth.ts` — `User` extended with `role` and `division`
- `types/index.ts` — re-exports everything from `@/types`
- `HandleInertiaRequests.php` — eager-loads `role` + `division` on every response
- `hooks/use-auth-user.ts` — `isProjectManager()`, `isBusinessDeveloper()`, `isTeamMember()`, `roleSlug`
- `components/nav-main.tsx` — `label` prop added for sidebar group names
- `components/app-sidebar.tsx` — full nav: Dashboard, Projects, My Tasks | Reports: Timeline, Calendar, Performance

### 13) Projects Index page (`/projects`)
- `ProjectController::index()` → `Inertia::render('projects/index')`
- `ProjectController::store()` → `redirect()->route('projects.show', $project)`
- `ProjectController::destroy()` → `redirect()->route('projects.index')`
- `pages/projects/index.tsx`:
  - Responsive card grid (1 → 2 → 3 columns)
  - Each card: status badge, due date, name, description (2-line), member count, task count, View button
  - Empty state (PM vs non-PM message)
  - Create Project dialog (PM only): name, description, start/due date
  - `useForm` for loading state + validation errors, `useAuthUser()` for role-gating

### 14) Project Show page (`/projects/{id}`)
- `ProjectController::show()` → `Inertia::render('projects/show')` with eager-loaded:
  `creator`, `users.role` (members), `tasks.assignee`
- `assignees` list (creator + members combined) passed separately for task form dropdown
- `TaskController::store()` → `redirect()->back()`
- `TaskController::updateStatus()` → `redirect()->back()`
- `TaskController::destroy()` → `redirect()->back()`
- `pages/projects/show.tsx`:
  - **Info header**: name, status badge, date range, creator, description
  - **Task list**:
    - Colored task workflow states (`todo`, `in_progress`, `pending_review`, `done`)
    - Members can request review through contextual "Request Review" action
    - `pending_review` and `done` displayed as locked workflow badges for non-PM users
    - title, assignee, due date, delete button (PM only), `window.confirm()` on delete
  - **Add Task dialog** (PM only): title, description, assign to (dropdown), priority, start/due date
  - **Members grid**: avatar initials, name, role name
  - Project show page refactored into smaller reusable task/thread components

### 15) Threaded Discussion UI — Project & Task Integration
- **Project-level thread** integrated into `pages/projects/show.tsx`
- Uses reusable `<ThreadSection>` component
- Displays project-wide threaded discussion with nested replies
- Task-level discussion integrated into contextual sheet flow:
  - `<TaskThreadSheet>` component
  - lazy-loaded task messages
  - nested replies
  - edit/delete authorization support
- `useTaskThread()` centralizes:
  - selected task state
  - lazy fetching
  - task sheet state
  - URL synchronization
- Task thread deep-link flow implemented:
  - `/projects/{project}?task={task}`
  - auto-open on page load
  - URL cleanup when sheet closes
- `TaskRow`, `CreateTaskDialog`, and thread flow extracted into reusable components
- Architecture intentionally keeps task discussion contextual to workspace flow instead of dedicated task detail pages

### 16) My Tasks page (`/my-tasks`)
- `TaskController::myTasks()` → `Inertia::render('tasks/my-tasks')`
- Frontend page: `pages/tasks/my-tasks.tsx`
- Backend supports:
  - status filters
  - project filters
  - pagination
- Frontend includes:
  - grouped task list by project
  - project filter dropdown
  - pagination controls
  - inline status updates
  - task thread integration via reusable `TaskThreadSheet`
- Sorted by due date (null last)
- Feature tests: `MyTaskEndpointTest`

### 17) Reports pages (`/reports/*`)
- `ReportingController::timeline()` → `Inertia::render('reports/timeline')`
- `ReportingController::calendar()` → `Inertia::render('reports/calendar')`
- `ReportingController::performance()` → `Inertia::render('reports/performance')`
- Frontend pages:
  - `pages/reports/timeline.tsx`
  - `pages/reports/calendar.tsx`
  - `pages/reports/performance.tsx`
- Reports scoped to accessible projects:
  - PM sees all
  - non-PM scoped to joined/created projects
- Timeline supports:
  - `project_id`
  - `status`
  - `start_date`
  - `end_date`
- Calendar supports:
  - `project_id`
  - `month`
- Performance supports:
  - `project_id`
- `pending_review` integrated into metrics/report filtering
- `ReportingContractTest` updated for Inertia responses

### 18) Dashboard page (`/dashboard`)
- `DashboardController::index()` → `Inertia::render('dashboard')`
- Dashboard statistics scoped to accessible projects/tasks
- Dashboard cards implemented:
  - accessible projects count
  - assigned tasks count
  - pending review count
  - overdue task count
- Recent activity feed implemented:
  - project updates
  - task updates
  - thread/message activity
- Activities merged and sorted by latest timestamp
- Activity items support:
  - contextual labels
  - relative timestamps
  - clickable navigation
  - activity icons by type
- Dashboard task activities support contextual deep-link flow:
  `/projects/{project}?task={task}`
- Dashboard intentionally follows lightweight workspace-oriented design rather than analytics-heavy reporting UI

---

## In Progress
- Nothing active right now.

---

## Pending (Next Work Queue)

Ordered by priority relative to context.md scope:

### Priority 1 — Approval/review workflow refinement
- Expand approval/rejection interaction inside `TaskThreadSheet`
- Refine PM review flow for `pending_review` tasks
- Keep workflow embedded inside existing task thread architecture

### Priority 2 — Polish and cleanup
- Continue UX polish and frontend refinement
- Improve loading states and empty states
- Small responsive layout refinements
- Optional optimistic UI improvements

### Deferred (nice-to-have, not core scope)
- Division-based project creation with division selector and auto-add of division members
- Add/remove member UI on project show page (backend exists, frontend not implemented)

---

## Decisions Locked
- Task statuses are fixed to: `todo`, `in_progress`, `pending_review`, `done`
- BD cannot create tasks
- Only PM can delete other users' messages
- PM rule is soft: at most one active PM. Transfer via dedicated endpoint only
- `store()` / `destroy()` → redirect-based Inertia flow
- `updateStatus()` → `redirect()->back()`
- Polymorphic message schema is final
- Project thread is eager-loaded; task thread is lazy-loaded
- Thread UI intentionally limits visible nesting depth to 1 level
- Dashboard direction is activity-centric instead of analytics-centric
- Project page acts as the primary collaborative workspace
- Task discussion remains contextual to workspace flow instead of standalone detail pages
- Task thread routing uses contextual deep-link pattern:
  `/projects/{project}?task={task}`
- Future activity indicators should remain lightweight and localStorage-based
- Avoid websocket, realtime sync, polling, or enterprise notification systems within TA scope
- Shared UI logic should prioritize reusable presentational components over complex abstractions
- Existing frontend patterns should remain:
  - `useForm`
  - `router.patch/delete`
  - Tailwind/native controls
  - `useAuthUser()` role checks
- Prefer local component state and prop passing over global state libraries

- Planned workflow refinement:
  - PM can create and assign tasks
  - Team Leads may directly complete owned/managed tasks
  - Regular members must request approval before completion
  - Proof/revision discussion remains inside task thread flow
  - Approval/rejection interactions remain embedded in `TaskThreadSheet`

---

## Known Issues / Risks
1. **Role seed dependency**
   PM transfer expects `roles.slug = project-manager`

2. **Authorization helper**
   Base `Controller` has no `AuthorizesRequests`
   Use `Gate::authorize()`

3. **Thread performance**
   Deep nested replies may become expensive without pagination

4. **Wayfinder route generation**
   `resources/js/routes/index.ts` auto-generates on `npm run dev`

5. **Activity indicators are browser-local only**
   Clearing local storage resets seen state
   Acceptable within TA prototype scope

---

## Minor refinement backlog
- Thread activity indicator polish
- Loading/empty state refinement
- Small responsive adjustments
- Approval/rejection interaction refinement inside `TaskThreadSheet`
- Further reuse of `TaskThreadSheet` across task-centric flows

---

## Notes For Future Agent Sessions
- Read `context.md` first, then this file
- API docs: `api-contract.md`
- Endpoint mapping: `backend-endpoint-guide.md`
- Password for all seeded accounts: `password`
- `npm run dev` must run alongside Laragon

### Frontend patterns established
- Role checks via `useAuthUser()`
- Forms via Inertia `useForm`
- Non-form mutations via `router.patch/delete`
- Shared types from `@/types`
- Native `<select>` with Tailwind styling preferred
- `window.confirm()` used for lightweight delete confirmation

### Scope guard
- Keep within TA prototype scope
- No enterprise workflow expansion
- No super-admin system
- Do not reduce collaboration/thread system into plain CRUD

---

## Suggested Commit Scopes

### Backend (done)
1. `feat(project): implement project + member management endpoints`
2. `feat(task): implement task CRUD and status flow`
3. `feat(thread): implement polymorphic threaded discussion endpoints`
4. `feat(my-task): implement current-user task endpoint`
5. `feat(reporting): implement timeline calendar and performance contracts`

### Frontend (done)
6. `feat(inertia): share role and division in Inertia shared data`
7. `feat(types): add shared model types for all backend entities`
8. `feat(hooks): add useAuthUser hook for role-aware UI`
9. `feat(nav): update sidebar with full app navigation`
10. `feat(seed): add seeders and update UserFactory`
11. `feat(projects): projects index page with create dialog`
12. `feat(projects): project show page with task list and members`
13. `test(messages): comprehensive message thread tests`
14. `feat(thread): integrate discussion thread into project and task contexts`
15. `feat(my-tasks): my tasks page with grouped task list and task thread access`
16. `feat(reports): timeline, calendar, and performance report pages`
17. `feat(dashboard): implement activity-centric dashboard with contextual navigation`

### Frontend (future)
18. `feat(task-review): refine approval and rejection interaction flow`
19. `polish(ui): improve loading, activity, and responsive states`