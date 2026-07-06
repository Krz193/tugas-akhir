<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Message;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\Task;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Seeds communication data using the two approved separate mechanisms:
     *
     * Project communication: Project → ProjectMessage (message_project table)
     * Task communication:    Task → Thread → Message
     *
     * No polymorphism. No parent_id threading. No shared table between mechanisms.
     */
    public function run(): void
    {
        $pm      = $this->employee('pm@djitugo.test');
        $bd      = $this->employee('bd@djitugo.test');
        $member1 = $this->employee('member1@djitugo.test'); // Citra
        $member2 = $this->employee('member2@djitugo.test'); // Deni
        $member3 = $this->employee('member3@djitugo.test'); // Eko

        $project1 = Project::where('name', 'Website Redesign')->firstOrFail();
        $project3 = Project::where('name', 'Brand Identity Refresh')->firstOrFail();

        $taskApi     = Task::where('title', 'API Integration')->firstOrFail();
        $taskTesting = Task::where('title', 'User Testing')->firstOrFail();

        // =================================================================
        // Project 1 — Website Redesign: project-level messages
        // =================================================================

        ProjectMessage::create([
            'project_id'   => $project1->id,
            'sender_id'    => $pm->id,
            'message_body' => 'Kick-off selesai. Kita mulai dari homepage redesign dulu ya. Deni tolong siapkan mockup minggu depan.',
        ]);

        ProjectMessage::create([
            'project_id'   => $project1->id,
            'sender_id'    => $member2->id,
            'message_body' => 'Siap! Saya akan kirim draft mockup Jumat ini.',
        ]);

        ProjectMessage::create([
            'project_id'   => $project1->id,
            'sender_id'    => $member1->id,
            'message_body' => 'Kalau mockup sudah fix, saya langsung mulai API integration.',
        ]);

        ProjectMessage::create([
            'project_id'   => $project1->id,
            'sender_id'    => $bd->id,
            'message_body' => 'Saya sudah review brief-nya. Pastikan tone visual konsisten dengan brand guideline yang lama ya.',
        ]);

        ProjectMessage::create([
            'project_id'   => $project1->id,
            'sender_id'    => $pm->id,
            'message_body' => 'Betul. Kita jadwalkan review bersama setelah mockup pertama selesai.',
        ]);

        // =================================================================
        // Task — API Integration: thread messages
        // =================================================================

        $thread1 = Thread::firstOrCreate(['task_id' => $taskApi->id]);

        Message::create([
            'thread_id'    => $thread1->id,
            'sender_id'    => $member1->id,
            'message_body' => 'Mulai integrasi hari ini. Pakai REST approach dengan JWT auth.',
        ]);

        Message::create([
            'thread_id'    => $thread1->id,
            'sender_id'    => $pm->id,
            'message_body' => 'Oke. Pastikan handle token refresh dengan benar ya, terutama saat session expired di tengah request.',
        ]);

        Message::create([
            'thread_id'    => $thread1->id,
            'sender_id'    => $member1->id,
            'message_body' => 'Sudah dihandle. Plus saya tambahkan retry logic untuk network error supaya UX-nya lebih mulus.',
        ]);

        // =================================================================
        // Task — User Testing: thread messages
        // =================================================================

        $thread2 = Thread::firstOrCreate(['task_id' => $taskTesting->id]);

        Message::create([
            'thread_id'    => $thread2->id,
            'sender_id'    => $member3->id,
            'message_body' => 'Testing session pertama sudah selesai. Ada 3 pain point utama yang perlu diperbaiki segera.',
        ]);

        Message::create([
            'thread_id'    => $thread2->id,
            'sender_id'    => $pm->id,
            'message_body' => 'Tolong dokumentasikan pain point-nya di sini supaya bisa langsung di-assign ke tim.',
        ]);

        // =================================================================
        // Project 3 — Brand Identity Refresh: project-level messages
        // =================================================================

        ProjectMessage::create([
            'project_id'   => $project3->id,
            'sender_id'    => $bd->id,
            'message_body' => 'Riset brand kompetitor sudah selesai. Kesimpulan: kita perlu visual yang lebih modern dan bold.',
        ]);

        ProjectMessage::create([
            'project_id'   => $project3->id,
            'sender_id'    => $pm->id,
            'message_body' => 'Bagus! Deni, bisa jadikan riset ini sebagai referensi utama untuk konsep logo?',
        ]);

        ProjectMessage::create([
            'project_id'   => $project3->id,
            'sender_id'    => $member2->id,
            'message_body' => 'Bisa! Saya akan buat 3 konsep berbeda untuk dipresentasikan minggu depan.',
        ]);
    }

    /**
     * Resolve an employee record by the linked user's email.
     */
    private function employee(string $email): Employee
    {
        return User::where('email', $email)->firstOrFail()->employee;
    }
}
