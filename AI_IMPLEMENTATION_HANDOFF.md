# DJITUGO PROJECT MANAGEMENT SYSTEM
## AI Implementation Handoff & Architecture Contract

> Dokumen ini adalah sumber konteks utama untuk AI coding agent seperti Claude Code, Codex, Antigravity, atau agent lain yang mengerjakan implementasi sistem.
>
> Tujuan dokumen ini adalah menjaga implementasi tetap konsisten dengan rancangan Use Case, Activity Diagram, Sequence Diagram, Class Diagram, dan ERD final.
>
> **Jangan melakukan redesign arsitektur, menambah fitur, role, entity, atau alur bisnis baru tanpa instruksi eksplisit.**

---

# 1. Project Overview

Nama sistem: **Djitugo Project Management System**

Tujuan sistem adalah mendukung pengelolaan pekerjaan internal pada perusahaan marketing agency Djitugo.

Teknologi utama:

- Laravel 12
- Inertia.js
- React
- Relational database
- Web application internal

Sistem digunakan untuk:

- autentikasi user;
- monitoring dashboard;
- pengelolaan user;
- pengelolaan project;
- pengelolaan anggota project;
- pengelolaan task;
- melihat My Task;
- memperbarui status task;
- melihat detail project;
- melihat detail task;
- mengirim pesan pada project;
- mengirim pesan pada thread task.

---

# 2. Non-Negotiable Rules for AI Agents

AI agent WAJIB mengikuti aturan berikut.

1. Jangan menambah fitur di luar rancangan tanpa instruksi eksplisit.
2. Jangan mengubah nama domain entity, method utama, dan alur use case tanpa alasan teknis yang dikonfirmasi.
3. Jangan memaksakan seluruh Class Diagram menjadi representasi literal tabel database.
4. Class Diagram bersifat OOP-oriented dan tidak identik 1:1 dengan ERD.
5. Laravel MVC adalah implementasi teknis, sedangkan Class Diagram menggambarkan responsibility object secara konseptual.
6. Validation bawaan Laravel tidak harus dibuat sebagai method domain khusus.
7. Pada Sequence Diagram, self-message seperti `validasi data`, `validasi status`, dan `validasi pesan` adalah proses internal controller, bukan method class domain yang wajib dibuat.
8. Jangan membuat `DashboardModel` atau tabel `dashboard`.
9. Dashboard mengambil data dari model/domain Project dan Task melalui controller secara sinkron.
10. Project message dan task message adalah dua mekanisme berbeda:
   - Project menggunakan `ProjectMessage`.
   - Task menggunakan `Thread` dan `Message`.
11. Jangan menyatukan ProjectMessage dengan Thread/Message.
12. Jangan membuat Role dan Division sebagai class domain CRUD karena keduanya diperlakukan sebagai master/seed data.
13. Gunakan bahasa Inggris untuk nama model, tabel, kolom, method, dan kode.
14. UI text boleh menggunakan bahasa Indonesia.
15. Implementasi harus mengikuti use case dan sequence yang sudah dirancang.

---

# 3. Roles

Sistem memiliki tiga role utama:

## Project Manager

Responsibility utama:

- melihat dashboard;
- mengelola user;
- mengelola project;
- mengelola anggota project;
- mengelola task;
- melihat detail project;
- melihat detail task;
- mengirim pesan project;
- mengirim pesan task.

## Business Developer

Responsibility utama:

- melihat dashboard;
- melihat project yang relevan;
- melihat detail project;
- mengirim pesan project;
- berpartisipasi pada komunikasi project sesuai akses.

## Member

Responsibility utama:

- melihat My Task;
- melihat detail task;
- memperbarui status task;
- mengirim pesan pada thread task.

Catatan:

Authorization harus mengikuti kebutuhan sistem dan policy/middleware Laravel yang sesuai.

---

# 4. Main Use Cases

Use case final sistem:

1. Login
2. Lihat Dashboard
3. Kelola User
4. Kelola Project
5. Kelola Anggota Project
6. Kelola Task
7. Lihat My Task
8. Update Status Task
9. Lihat Detail Project
10. Kirim Pesan Project
11. Lihat Detail Task
12. Kirim Pesan Task

CRUD child use case:

## Kelola User

- Tambah User
- Edit User
- Hapus User

## Kelola Project

- Tambah Project
- Edit Project
- Hapus Project

## Kelola Task

- Tambah Task
- Edit Task
- Hapus Task

## Kelola Anggota Project

- Tambah Anggota
- Hapus Anggota

---

# 5. Domain Classes and Required Operations

## 5.1 User

Conceptual responsibility:

- account data;
- employee profile data;
- user management.

Attributes:

```text
userId: int
employeeId: int
roleId: int
divisionId: int
name: string
email: string
password: string
phone: string
address: string
status: string
```

Required operations:

```text
findUserByEmail(email)
getUsers()
getUser(userId)
createUser(userData)
updateUser(userId, userData)
deleteUser(userId)
```

Implementation notes:

- Class Diagram menggabungkan account dan employee profile secara konseptual.
- Database boleh memisahkan tabel user dan employee.
- Jangan menghapus pemisahan database hanya karena Class Diagram memakai satu class `User`.
- Field final Employee: `user_id`, `role_id`, `division_id`, `name`, `phone`, `address`.
- UI memakai fallback inisial/nama saja.
- Tidak ada upload, display, atau storage avatar dalam implementasi final.

---

## 5.2 Auth

Attributes:

```text
email: string
password: string
authenticatedUser: object
```

Required operations:

```text
login(email, password)
validateCredentials(user, password)
createSession(user)
```

Login conceptual flow:

```text
LoginPage
→ AuthController.login(email, password)
→ User.findUserByEmail(email)
→ Auth.validateCredentials(user, password)
→ Auth.createSession(user)
→ redirect dashboard
```

Laravel built-in authentication may be used, tetapi behavior harus tetap setara dengan alur di atas.

---

## 5.3 Dashboard

Dashboard diperlakukan sebagai controller/control responsibility, bukan persistent model.

Attributes:

```text
projectSummary: object
recentActivities: object
incomingDueTasks: object
calendarData: object
selectedDateDeadlines: object
timelineData: object
selectedMonth: date
```

Operations:

```text
requestDashboard()
getProjectSummary()
getRecentActivities()
getIncomingDueTasks()
getCalendarData()
getDeadlinesByDate(selectedDate)
getTimelineData()
```

Dashboard contents:

### Project Summary

Tampilkan tepat enam summary utama:

1. Total Project
2. Active Project
3. Completed Project
4. Overdue Project
5. Total Task
6. Unfinished Task

Jangan menambahkan Done Task sebagai summary terpisah kecuali diminta.

### Recent Activities

Source:

```text
Task.updated_at
```

Recent Activities hanya melacak update terbaru pada task.

Jangan membuat activity log multi-table jika tidak diminta.

Data yang dapat ditampilkan:

```text
taskTitle
projectName
status
updatedAt
```

Interpretasi:

`updated_at` menunjukkan task diperbarui. Jangan otomatis menyatakan bahwa status pasti berubah jika sistem tidak menyimpan jenis perubahan.

### Incoming Due Tasks

Source utama:

```text
Task
```

Tujuan:

menampilkan task yang mendekati due date dan belum selesai.

### Calendar Overview

Data berasal dari dua source:

```text
Project
Task
```

Sequence conceptual:

```text
DashboardController → ProjectModel
getCalendarData()

ProjectModel → DashboardController
projectCalendarData

DashboardController → TaskModel
getCalendarData()

TaskModel → DashboardController
taskCalendarData

DashboardController
menggabungkan data calendar
```

Pemanggilan dilakukan secara sinkron dan berurutan.

Nama method yang sama dengan receiver berbeda diperbolehkan secara konsep:

```text
ProjectModel.getCalendarData()
TaskModel.getCalendarData()
```

### Deadline by Date

Data berasal dari:

```text
Project
Task
```

Initial dashboard boleh menggunakan:

```text
getDeadlinesByDate(today)
```

Flow:

```text
DashboardController → ProjectModel
getDeadlinesByDate(today)

DashboardController → TaskModel
getDeadlinesByDate(today)
```

Controller menggabungkan hasil keduanya.

### Project Timeline

Source utama:

```text
Project
```

---

## 5.4 Project

Attributes:

```text
projectId: int
projectName: string
description: string
startDate: date
dueDate: date
status: string
```

Required operations:

```text
getProjects()
getProject(projectId)
createProject(projectData)
updateProject(projectId, projectData)
deleteProject(projectId)
```

Project detail membutuhkan data gabungan dari:

```text
Project
Task
ProjectMember
ProjectMessage
```

---

## 5.5 ProjectMember

Attributes:

```text
projectId: int
employeeId: int
isLeader: boolean
dateJoined: date
```

Required operations:

```text
getMembersByProject(projectId)
addMember(projectId, memberData)
deleteMember(projectId, employeeId)
```

Notes:

- Duplicate member validation dapat dilakukan di internal logic.
- Tidak perlu method class khusus `validateMember()`.
- Identifier yang dipakai adalah `employeeId`, bukan `memberId`.

---

## 5.6 Task

Attributes:

```text
taskId: int
projectId: int
assignedEmployeeId: int
taskTitle: string
description: string
startDate: date
dueDate: date
status: string
```

Required operations:

```text
getTasks(projectId)
getTask(taskId)
getMyTasks(employeeId)
createTask(projectId, taskData)
updateTask(taskId, taskData)
deleteTask(taskId)
updateStatus(taskId, status)
```

Important rules:

- Task terkait dengan Project.
- Task memiliki assigned employee.
- My Task menggunakan `getMyTasks(employeeId)`.
- Update Status dipisahkan dari full task update.

---

## 5.7 Thread

Attributes:

```text
threadId: int
taskId: int
```

Required operation:

```text
getTaskThread(taskId)
```

Important:

Thread hanya digunakan untuk komunikasi pada Task.

Jangan menggunakan Thread untuk Project Message.

---

## 5.8 Message

Attributes:

```text
messageId: int
threadId: int
senderId: int
messageBody: string
```

Required operations:

```text
getMessagesByThread(threadId)
sendTaskMessage(taskId, messageBody)
```

Conceptual relation:

```text
Task
→ Thread
→ Message
```

Message memiliki sender.

---

## 5.9 ProjectMessage

Attributes:

```text
projectMessageId: int
projectId: int
senderId: int
messageBody: string
```

Required operations:

```text
getMessagesByProject(projectId)
sendProjectMessage(projectId, messageBody)
```

Conceptual relation:

```text
Project
→ ProjectMessage
```

ProjectMessage memiliki sender.

Important:

Jangan membuat Project Message melalui:

```text
Project
→ Thread
→ Message
```

Itu desain lama dan sudah tidak digunakan.

---

# 6. Main Sequence Contracts

## 6.1 Login

```text
User → LoginPage
membuka halaman login

User → LoginPage
mengisi data login

LoginPage → AuthController
login(email, password)

AuthController
validasi data

AuthController → UserModel
findUserByEmail(email)

UserModel → AuthController
user

AuthController
validateCredentials(user, password)

alt credentials valid
    AuthController
    createSession(user)

    AuthController → LoginPage
    redirectDashboard
else credentials invalid
    AuthController → LoginPage
    errorMessage

    LoginPage → User
    menampilkan pesan error
end
```

---

## 6.2 Dashboard

Lifelines:

```text
BD / Project Manager
DashboardPage
DashboardController
ProjectModel
TaskModel
```

Main flow:

```text
Actor → DashboardPage
membuka menu dashboard

DashboardPage → DashboardController
requestDashboard()

DashboardController → ProjectModel
getProjectSummary()

ProjectModel → DashboardController
projectSummary

DashboardController → TaskModel
getRecentActivities()

TaskModel → DashboardController
recentActivities

DashboardController → TaskModel
getIncomingDueTasks()

TaskModel → DashboardController
incomingDueTasks

DashboardController → ProjectModel
getCalendarData()

ProjectModel → DashboardController
projectCalendarData

DashboardController → TaskModel
getCalendarData()

TaskModel → DashboardController
taskCalendarData

DashboardController → ProjectModel
getDeadlinesByDate(today)

ProjectModel → DashboardController
projectDeadlines

DashboardController → TaskModel
getDeadlinesByDate(today)

TaskModel → DashboardController
taskDeadlines

DashboardController → ProjectModel
getTimelineData()

ProjectModel → DashboardController
timelineData

DashboardController → DashboardPage
dataDashboard

DashboardPage → Actor
menampilkan dashboard
```

Implementation detail:

Controller boleh menggabungkan calendar dan deadline result sebelum mengirim `dataDashboard`.

---

## 6.3 Kelola User

Read:

```text
getUsers()
```

Create:

```text
createUser(userData)
→ validasi data
→ UserModel.createUser(userData)
```

Update:

```text
getUser(userId)
updateUser(userId, userData)
→ validasi data
→ UserModel.updateUser(userId, userData)
```

Delete:

```text
deleteUser(userId)
→ UserModel.deleteUser(userId)
```

---

## 6.4 Kelola Project

Read:

```text
getProjects()
```

Create:

```text
createProject(projectData)
→ validasi data
→ ProjectModel.createProject(projectData)
```

Update:

```text
getProject(projectId)
updateProject(projectId, projectData)
→ validasi data
→ ProjectModel.updateProject(projectId, projectData)
```

Delete:

```text
deleteProject(projectId)
→ ProjectModel.deleteProject(projectId)
```

---

## 6.5 Kelola Task

Read:

```text
getTasks(projectId)
```

Create:

```text
createTask(projectId, taskData)
→ validasi data
→ TaskModel.createTask(projectId, taskData)
```

Update:

```text
getTask(taskId)
updateTask(taskId, taskData)
→ validasi data
→ TaskModel.updateTask(taskId, taskData)
```

Delete:

```text
deleteTask(taskId)
→ TaskModel.deleteTask(taskId)
```

---

## 6.6 Kelola Anggota Project

Create:

```text
addMember(projectId, memberData)
→ validasi data
→ ProjectMemberModel.addMember(projectId, memberData)
```

Delete:

```text
deleteMember(projectId, employeeId)
→ ProjectMemberModel.deleteMember(projectId, employeeId)
```

---

## 6.7 My Task

```text
MyTaskPage → TaskController
getMyTasks(employeeId)

TaskController → TaskModel
getMyTasks(employeeId)

TaskModel → TaskController
taskList

TaskController → MyTaskPage
taskList
```

---

## 6.8 Update Status Task

```text
MyTaskPage → TaskController
getTask(taskId)

TaskController → TaskModel
getTask(taskId)

TaskModel → TaskController
taskData

User chooses status

MyTaskPage → TaskController
updateStatus(taskId, status)

TaskController
validasi status

alt status valid
    TaskController → TaskModel
    updateStatus(taskId, status)
else status invalid
    TaskController → MyTaskPage
    errorMessage
end
```

---

## 6.9 Detail Project

Data source:

```text
ProjectModel
TaskModel
ProjectMemberModel
ProjectMessageModel
```

Flow:

```text
ProjectDetailPage → ProjectController
getProject(projectId)

ProjectController → ProjectModel
getProject(projectId)

ProjectController → TaskModel
getTasks(projectId)

ProjectController → ProjectMemberModel
getMembersByProject(projectId)

ProjectController → ProjectMessageModel
getMessagesByProject(projectId)

ProjectController → ProjectDetailPage
projectDetail
```

---

## 6.10 Send Project Message

Lifelines:

```text
User
ProjectDetailPage
MessageController
ProjectMessageModel
```

Flow:

```text
User
mengisi pesan project

ProjectDetailPage → MessageController
sendProjectMessage(projectId, messageBody)

MessageController
validasi pesan

alt pesan valid
    MessageController → ProjectMessageModel
    sendProjectMessage(projectId, messageBody)

    ProjectMessageModel → MessageController
    messageSaved

    MessageController → ProjectDetailPage
    projectMessages

    ProjectDetailPage → User
    menampilkan pesan project
else pesan tidak valid
    MessageController → ProjectDetailPage
    errorMessage

    ProjectDetailPage → User
    menampilkan pesan error
end
```

---

## 6.11 Detail Task

```text
TaskDetailPage → TaskController
getTask(taskId)

TaskController → TaskModel
getTask(taskId)

TaskController → ThreadModel
getTaskThread(taskId)

TaskController → TaskDetailPage
taskDetail
```

---

## 6.12 Send Task Message

Lifelines:

```text
User
TaskDetailPage
MessageController
ThreadModel
MessageModel
```

Flow:

```text
User
mengisi pesan task

TaskDetailPage → MessageController
sendTaskMessage(taskId, messageBody)

MessageController
validasi pesan

alt pesan valid
    MessageController → ThreadModel
    getTaskThread(taskId)

    ThreadModel → MessageController
    taskThread

    MessageController → MessageModel
    sendTaskMessage(taskId, messageBody)

    MessageModel → MessageController
    messageSaved

    MessageController → TaskDetailPage
    updatedTaskThread

    TaskDetailPage → User
    menampilkan pesan pada thread task
else pesan tidak valid
    MessageController → TaskDetailPage
    errorMessage

    TaskDetailPage → User
    menampilkan pesan error
end
```

---

# 7. ERD Interpretation Rules

Class Diagram dan ERD tidak wajib 1:1.

Database design memiliki konsep utama:

```text
user
employee
role
division
project
project_member
task
thread
message
message_project / project_message
```

Important relational concepts:

```text
User
1 account
→ Employee profile
```

```text
Project
→ ProjectMember
→ Employee
```

```text
Project
→ Task
```

```text
Task
→ assigned Employee
```

```text
Task
→ Thread
→ Message
```

```text
Project
→ ProjectMessage
```

```text
Employee/User
→ sender of Message
```

```text
Employee/User
→ sender of ProjectMessage
```

Foreign-key naming expected conceptually:

```text
task.project_id
task.assigned_employee_id

project_member.project_id
project_member.employee_id

thread.task_id

message.thread_id
message.sender_id

project_message.project_id
project_message.sender_id
```

If actual ERD table name is `message_project`, preserve the existing schema naming unless instructed to rename.

Do not perform destructive schema rename solely for aesthetic consistency.

---

# 8. Controller Responsibilities

Suggested implementation controllers:

```text
AuthController
DashboardController
UserController
ProjectController
TaskController
MessageController
```

Project member operations may remain under `ProjectController` if that matches current application structure.

Do not create excessive controllers or services merely to mimic every UML class.

Create service classes only when implementation complexity genuinely requires them.

---

# 9. Validation Rules

Validation must be implemented using Laravel validation mechanisms.

Conceptual self-message:

```text
validasi data
```

means:

- validate request payload;
- return validation error when invalid;
- proceed to model/domain operation when valid.

Do not create domain methods such as:

```text
validateProject()
validateTask()
validateUser()
validateMessage()
```

unless there is reusable business validation that truly deserves a separate service/domain method.

---

# 10. Implementation Priority

Recommended order:

1. Inspect existing Laravel project structure.
2. Compare existing migrations/models against final ERD.
3. Apply schema adjustments carefully.
4. Align Eloquent models and relationships.
5. Implement authentication and authorization.
6. Implement User management.
7. Implement Project management.
8. Implement Project Member management.
9. Implement Task management.
10. Implement My Task.
11. Implement Task status update.
12. Implement Project Detail.
13. Implement Project Message.
14. Implement Task Detail.
15. Implement Task Thread Message.
16. Implement Dashboard queries and aggregation.
17. Add tests.
18. Cross-check implementation against this document.

---

# 11. Agent Workflow Rules

Before modifying code, agent must:

1. inspect current codebase;
2. identify existing implementation;
3. compare current code with this contract;
4. produce a small implementation plan;
5. modify only relevant files;
6. avoid unrelated refactor;
7. run available tests/lint/type checks;
8. report:
   - files changed;
   - behavior changed;
   - migrations required;
   - tests run;
   - remaining mismatch.

Never rewrite the whole project unless explicitly requested.

---

# 12. Definition of Done

A feature is considered complete only if:

- route exists;
- authorization is correct;
- controller flow matches intended use case;
- model/domain operation uses the agreed naming and responsibility;
- validation exists;
- success state is handled;
- failure state is handled;
- UI receives required data;
- database relation is respected;
- tests pass or missing tests are explicitly reported;
- no unrelated feature is introduced.

---

# 13. Final Consistency Checklist

Before claiming implementation is complete, verify:

## Authentication

- `login(email, password)` flow works.
- user lookup by email works.
- invalid credentials show error.
- valid credentials create authenticated session.

## Dashboard

- exactly six agreed summary widgets.
- recent activity comes from Task updates.
- incoming due tasks are task-based.
- calendar merges Project and Task data.
- selected-date deadlines merge Project and Task data.
- timeline uses Project data.
- no Dashboard table/model created.

## User

- list, detail, create, update, delete.

## Project

- list, detail, create, update, delete.

## Project Member

- list by project.
- add member.
- remove member using employee ID.

## Task

- list by project.
- detail.
- My Task.
- create.
- update.
- delete.
- update status.

## Project Message

- list by project.
- send directly by project ID.
- sender stored.
- does not use Thread.

## Task Message

- task resolves Thread.
- message stored under Thread.
- sender stored.
- task message behavior remains separate from Project Message.

---

# 14. Forbidden Drift

Do not introduce any of the following without explicit instruction:

- new roles;
- new use cases;
- generic activity log system;
- Project Thread;
- Dashboard table;
- DashboardModel;
- merging ProjectMessage into Message polymorphically;
- removing Task Thread;
- renaming major schema objects destructively;
- changing ERD relationships merely to imitate Laravel conventions;
- adding event sourcing, CQRS, repository pattern, microservices, or other architecture unrelated to current scope;
- replacing Laravel + Inertia + React stack.

The system should remain straightforward, maintainable, and aligned with the approved diagrams.

---

# 15. Source of Truth Priority

When conflicts appear, use the following priority:

1. Latest explicit user instruction.
2. This implementation handoff document.
3. Final Sequence Diagram for interaction flow.
4. Final Class Diagram for object responsibility and operation naming.
5. Final ERD for persistent data structure.
6. Final Activity Diagram for business process flow.
7. Final Use Case Diagram for actor scope and system capability.
8. Existing code, only when it does not conflict with the approved design.

Do not silently choose existing legacy code over approved design. Report the conflict first.

---

# 16. Short Agent Prompt

Use this when starting a coding-agent session:

> Read `AI_IMPLEMENTATION_HANDOFF.md` completely before changing code. Treat it as the architecture and behavior contract for the Djitugo Project Management System. Inspect the existing Laravel 12 + Inertia React codebase, compare it with the contract, and implement only the requested scope. Do not redesign the architecture, add features, merge ProjectMessage with Task Thread Message, create a DashboardModel/table, or rename domain concepts without explicit instruction. Before editing, summarize the current implementation gap and planned files. After editing, run relevant checks and report changed files, tests, migrations, and remaining mismatches.

---

# 17. Current Project State

The design phase has been cross-checked across:

- Use Case Diagram;
- Activity Diagram;
- Sequence Diagram;
- Class Diagram;
- ERD.

The system is ready to proceed into implementation, with this file serving as the common context contract for coding agents.
