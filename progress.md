# Project Progress Snapshot

Last updated: 2026-05-10 (Asia/Makassar)
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
- `ProjectController::store()` → `redirect()->route('projects.index')`
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

### 15) Threaded Discussion UI — Project & Task Integration ✅
- **Project-level thread** integrated into `pages/projects/show.tsx`:
  - Displays project-wide messages with nested replies
  - Eager-loaded from `ProjectController::show()` 
  - Uses reusable `<ThreadSection>` component
- **Task-level thread** integrated into task sheet modal:
  - `<TaskThreadSheet>` component with lazy-loaded messages
  - Opens on task click, displays nested replies
  - Supports create reply, edit own, delete own (PM can delete any)
  - Uses `useTaskThread()` hook for state management
  - Task discussion messages fetched on-demand when sheet opens.
  - Task thread state isolated from project page for maintainability
- **Components** ready (`thread-section.tsx`, `message-card.tsx`, `task-thread-sheet.tsx`)
  - Project & task threading, nesting validation, authorization, CRUD operations
  - Task thread flow extracted into dedicated `TaskThreadSheet` component
  - Task thread state centralized through reusable `useTaskThread()` hook
  - `TaskRow` extracted into reusable task presentation component
  - `CreateTaskDialog` separated from project show page
  - Project show page refactored into smaller reusable task/thread components

### 16) My Tasks page (`/my-tasks`)
- `TaskController::myTasks()` → `Inertia::render('tasks/my-tasks')`
- Frontend page: `pages/tasks/my-tasks.tsx` with task grouping by project
- Filterable list with status & project filters, pagination (default 15 per page)
- Inline status update (via `TaskRow` component)
- Task thread integration (lazy-loaded `TaskThreadSheet`)
- Sorted by due date (null last)
- Feature tests: `MyTaskEndpointTest` (3 tests, all passing)

### 17) Division-based project creation
- Database: `projects.division_id` nullable FK to divisions (migration: `2026_05_12_000001_add_division_id_to_projects_table`)
- Backend logic:
  - `StoreProjectRequest` validates `division_id`
  - `ProjectController::store()` automatically adds all division members to project when `division_id` is specified
  - Creator is excluded from auto-assignment
- Frontend enhancement:
  - Create Project dialog adds division selector (optional field)
  - Member selection now labeled "Add Additional Members" and is optional
  - Info message displays when division selected: "All division members will be automatically added to this project"
  - `ProjectController::index()` passes divisions list to frontend
- Benefit: Streamlines project setup by auto-populating team members from selected division

---

## In Progress
- Nothing active right now.

---

## Pending (Next Work Queue)

Ordered by priority relative to context.md scope:

### � Priority 1 — Reports pages
| Page | Route | Backend | Frontend | Tests |
|---|---|---|---|---|
| Timeline | `/reports/timeline` | ✅ Ready | ❌ Missing | ✅ Written |
| Calendar | `/reports/calendar` | ✅ Ready | ❌ Missing | ✅ Written |
| Performance | `/reports/performance` | ✅ Ready | ❌ Missing | ✅ Written |

- All 3 reporting endpoints fully implemented and tested (bug fix: added `pending_review` to timeline & performance metrics)
- Need to create: `pages/reports/timeline.tsx`, `pages/reports/calendar.tsx`, `pages/reports/performance.tsx`

### 🟡 Priority 2 — Dashboard completion
- Currently placeholder-only (`pages/dashboard.tsx`)
- Recommend simple widget layout: project count, task count, recent activity
- Defer complex metrics to final polish phase if timeline is tight

### ⚪ Deferred (nice-to-have, not core scope)
- Edit project form (currently no frontend for `PATCH /projects/{project}`)
- Add/remove member UI on project show page (backend exists, no frontend)
- Task detail page (currently no `show` page for individual tasks)

---

## Decisions Locked
- Task statuses are fixed to: `todo`, `in_progress`, `pending_review`, `done`.
- BD cannot create tasks.
- Only PM can delete other users' messages.
- PM rule is soft: at most one active PM. Transfer via dedicated endpoint only.
- `store()` / `destroy()` → `redirect()` after mutation (Inertia page flow).
- `updateStatus()` → `redirect()->back()` (Inertia page flow).
- Polymorphic message schema is final — no nullable `project_id/task_id`.
- Task-level discussion uses Sheet/Drawer instead of dedicated task detail page.
- Project thread is eager-loaded; task thread is lazy-loaded.
- Thread UI intentionally limits visible nesting depth to 1 level.
- If activity indicators are added later, they should remain lightweight and localStorage-based rather than implementing synchronized unread tracking.
- Future activity indicators should prefer subtle dot/new-state indicators over numeric unread badges.
- Shared UI logic should prioritize reusable presentational components (e.g. `ThreadSection`) over complex state-heavy abstractions.
- Components should remain beginner-friendly and avoid unnecessary architectural complexity.
- Existing frontend patterns should remain consistent: `useForm`, `router.patch/delete`, role checks via `useAuthUser`,and Tailwind/native form controls.
- Avoid introducing websocket, polling, realtime sync, or enterprise-style notification systems within TA prototype scope.
- Task discussion should remain contextually attached to the task list flow, not expanded into a separate task management module.
- Prefer local component state and prop passing over global state management libraries.

- Planned task workflow refinement:
  - PM can create tasks and assign them to Team Leads or members.
  - Team Leads may directly complete tasks they own/manage.
  - Regular members cannot directly set tasks to `done`; they must request approval first.
  - Task proof/revision discussion should happen through the existing task thread system instead of dedicated proof upload forms.
  - Approval/rejection actions should remain embedded inside the task sheet flow (`TaskThreadSheet`).
  - `TaskThreadSheet` should become the centralized interaction surface for task discussion and approval flow across both Project Show and My Tasks pages.

---

## Known Issues / Risks
1. **Role seed dependency** — PM transfer expects `roles.slug = project-manager`. Seed first.
2. **Authorization helper** — Base `Controller` has no `AuthorizesRequests`. Use `Gate::authorize()`.
3. **Thread performance** — Deep nested replies can be expensive without pagination (future concern).
4. **Wayfinder route generation** — `resources/js/routes/index.ts` auto-generates on `npm run dev`.
   Currently new app routes use plain string hrefs (e.g. `'/projects'`) instead of named helpers.
5. **Activity indicators are browser-local only.**
   Clearing browser storage or switching device resets seen state.
   Acceptable within TA prototype scope.

---

### Minor refinement backlog
- Thread activity indicator polish
- Empty/loading state refinement
- Small responsive UI adjustments
- Optional optimistic UI improvements
- Approval/rejection action refinement inside `TaskThreadSheet`
- My Tasks integration with reusable `TaskThreadSheet`

---

## Notes For Future Agent Sessions
- Read `context.md` first, then this file.
- API docs: `api-contract.md`. Endpoint mapping: `backend-endpoint-guide.md`.
- **Login accounts:** see section 11 above. Password is always `password`.
- **Frontend dev:** `npm run dev` must be running alongside Laragon.
- **Converting a controller to Inertia:**
  - `index()` / `show()` → `Inertia::render('page/path', [data])`
  - `store()` / `update()` / `destroy()` / `updateStatus()` → `redirect()->back()` or `redirect()->route(...)`
  - Update the feature test assertion from `assertCreated/assertNoContent/assertOk` to `assertRedirect()`
- **Frontend patterns established:**
  - Role checks: `useAuthUser()` hook — never read `auth.user.role.slug` directly
  - Forms: `useForm` from Inertia — handles loading, errors, reset
  - Mutations: `router.patch()` / `router.delete()` from Inertia for non-form actions
  - All types: `resources/js/types/models.ts`, importable via `@/types`
  - Native `<select>` styled with Tailwind used for inline dropdowns (no Radix Select needed)
  - `window.confirm()` used for delete confirmation (simple, beginner-friendly)
- **Scope guard:** Keep within TA prototype scope. No super-admin, no enterprise features.
  context.md section 9 warns: "Jangan sederhanakan sistem jadi CRUD biasa" —
  make sure discussion/collaboration features are not skipped.

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
13. `test(messages): comprehensive message thread tests (14 tests covering CRUD, nesting, auth)`
14. `feat(thread): integrate discussion thread into project and task contexts`

### Frontend (next to implement)
15. `feat(my-tasks): my tasks page with filters and inline status update`
16. `feat(reports): timeline, calendar, and performance report pages`
17. `polish(dashboard): update dashboard with project/task summaries`
