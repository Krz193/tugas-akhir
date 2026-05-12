# PROJECT CONTEXT - DJITUGO PROJECT MANAGEMENT SYSTEM

## 1. Overview
Djitugo adalah sistem manajemen proyek berbasis web yang dirancang untuk mendukung kolaborasi lintas divisi dalam satu platform terintegrasi.

Tujuan utama:
- Mengintegrasikan task management dan komunikasi
- Mengurangi fragmentasi tools (WhatsApp, Trello, dll)
- Menyediakan monitoring dan evaluasi proyek secara terpusat

---

## 2. Actors & Roles

### 1. Project Manager
- Membuat project
- Menambahkan anggota project
- Mengelola task
- Monitoring progress

### 2. Business Developer
- Memberikan review / masukan
- Ikut diskusi project

### 3. Team Member
- Mengerjakan task
- Update status task
- Berpartisipasi dalam diskusi

---

## 3. Core Features

### 3.1 Project Management
- Create project
- Assign member (ProjectMember)
- Manage project data

### 3.2 Task Management
- Create task
- Assign user
- Update status
- Due date & timeline

### 3.3 Threaded Discussion (IMPORTANT)
- Thread tersedia pada:
  - Project level
  - Task level
- Mendukung:
  - Nested reply (parent_id)
- Fungsi:
  - Diskusi
  - Revisi
  - Feedback lintas divisi

### 3.4 My Task View
- Task spesifik per user
- Fokus kerja individu

### 3.5 Timeline & Calendar View
- Visualisasi progress lintas divisi
- Representasi waktu (start → deadline)

### 3.6 Performance Insight Dashboard
- Analisis:
  - Progress
  - Produktivitas tim
- Data-driven monitoring

---

## 4. Data Structure

### Entities:
- Role
- Division
- User
- Project
- ProjectMember
- Task
- Attachment
- Message

### Relationships:
- User -> Role
- User -> Division
- Project -> ProjectMember -> User
- Project -> Task
- Task -> Attachment
- Message -> polymorphic owner (Project / Task)
- Message -> parent_id (threading)

### Message Architecture
Message uses Laravel polymorphic relationship:

- messageable_type
- messageable_id

This allows messages/discussions to belong to:
- Project
- Task

Purpose:
- Avoid nullable foreign keys
- Support reusable threaded discussion architecture
- Easier future scalability for discussion system

---

## 5. Business Rules

- User hanya bisa akses project yang diikuti
- Task harus berada dalam project
- Message harus terkait project atau task
- Thread mendukung reply (parent-child)
- Status task mempengaruhi progress

---

## 6. Key Differentiation

- Kolaborasi lintas divisi (bukan sekadar task list)
- Threaded discussion kontekstual
- Timeline & calendar visualization
- Performance insight dashboard

---

## 7. System Architecture

- Backend: Laravel (MVC)
- Frontend: React + Inertia.js
- Database: MySQL

---

## 8. Workflow Focus

Core flow:
1. Project dibuat
2. Member ditambahkan
3. Task dibuat & didistribusikan
4. Diskusi terjadi via thread
5. Task diupdate
6. Progress & performance dimonitor

---

## 9. AI Assistant Guidelines

- Jangan sederhanakan sistem jadi CRUD biasa
- Selalu pertimbangkan role (PM, BD, Member)
- Thread harus support nested reply (parent_id)
- Message bisa terkait project atau task
- Prioritaskan fitur kolaborasi, bukan hanya task

---

## 10. Constraints

- Internal system (bukan public SaaS)
- Tidak perlu fitur enterprise kompleks
- Fokus pada prototyping (TA scope)
