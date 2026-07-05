# Djitugo Agent Handoff

Read order:
1. context.md
2. this file
3. progress.md only if deeper history is needed

Project:
Laravel + React + Inertia project management prototype.

Non-negotiables:
- Do not simplify into CRUD-only app.
- Preserve role-aware flow: PM, BD, Team Member.
- Messages are polymorphic: Project or Task.
- Threads support parent_id replies.
- Task statuses: todo, in_progress, pending_review, done.

Current state:
- Backend core architecture is mostly complete.
- Project index/show implemented with Inertia.
- Project and task thread UI fully integrated.
- My Tasks page implemented with filters, pagination, grouped task display, and reusable task thread integration.
- Reports module implemented and wired as Inertia pages:
  - `pages/reports/timeline.tsx`
  - `pages/reports/calendar.tsx`
  - `pages/reports/performance.tsx`
  - `ReportingController` renders report pages with scoped props.
- Dashboard implemented as lightweight activity-centric workspace overview:
  - stats cards
  - recent activity feed
  - contextual navigation
  - task deep-link support (`?task=` pattern)
- `TaskThreadSheet` now supports contextual deep-link routing:
  - `/projects/{project}?task={task}`
  - auto-open on page load
  - URL cleanup when sheet closes
- Project show page has been refactored into smaller reusable components/hooks:
  - `TaskRow`
  - `TaskThreadSheet`
  - `CreateTaskDialog`
  - `ThreadSection`
  - `useTaskThread`

Known issues:
- Some older feature tests still expect legacy JSON responses instead of Inertia redirects/pages.
- Full `php artisan test` still has several intentionally stale expectation failures:
  - `ProjectManagementTest`
    - expects old JSON project create response
  - `MyTaskEndpointTest`
    - expects old JSON payload instead of Inertia page props
  - `TaskManagementTest`
    - expects direct `todo -> done`
    - current workflow requires `pending_review`
- Existing implementation is considered source-of-truth over stale test expectations.
- Project edit flow now correctly syncs `member_ids` through backend update flow.
- Activity indicators are intentionally lightweight/local-only and not realtime.

Architecture notes:
- Dashboard intentionally avoids enterprise analytics complexity.
- Project page acts as the primary collaborative workspace.
- Task discussions remain contextual to project/task flow rather than standalone detail pages.
- Project-level thread is eager-loaded.
- Task-level thread is lazy-loaded on demand.
- Avoid introducing websocket/realtime/polling systems within prototype scope.
- Prefer reusable presentational components over global state abstractions.
- Prefer local component state and prop-driven flows.

Next recommended work:
1. Approval/rejection refinement inside `TaskThreadSheet`
2. UX polish and loading state cleanup
3. Small responsive refinements
4. Optional optimistic UI improvements

Verify:
- `npm run types`
- `npm run build`
- `php artisan test tests\Feature\ReportingContractTest.php`
- `php artisan test`

Important frontend conventions:
- Role checks via `useAuthUser()`
- Forms via Inertia `useForm`
- Mutations via `router.patch/delete`
- Shared types from `@/types`
- Native Tailwind-styled form controls preferred
- Lightweight UX over enterprise abstractions

Scope guard:
- Keep within TA prototype scope.
- No super-admin systems.
- No enterprise notification architecture.
- Do not flatten collaboration/thread flow into simple CRUD interactions.