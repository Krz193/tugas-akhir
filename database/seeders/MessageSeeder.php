<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Creates threaded discussions at both project and task level.
     *
     * Each "thread" starts with a top-level message (parent_id = null),
     * then has one or more replies (parent_id = the top message's id).
     *
     * messageable_type uses the full Laravel model class path.
     */
    public function run(): void
    {
        $pm      = User::where('email', 'pm@djitugo.test')->firstOrFail();
        $bd      = User::where('email', 'bd@djitugo.test')->firstOrFail();
        $member1 = User::where('email', 'member1@djitugo.test')->firstOrFail(); // Citra
        $member2 = User::where('email', 'member2@djitugo.test')->firstOrFail(); // Deni
        $member3 = User::where('email', 'member3@djitugo.test')->firstOrFail(); // Eko

        $project1 = Project::where('name', 'Website Redesign')->firstOrFail();
        $project3 = Project::where('name', 'Brand Identity Refresh')->firstOrFail();

        $taskApi     = Task::where('title', 'API Integration')->firstOrFail();
        $taskTesting = Task::where('title', 'User Testing')->firstOrFail();

        // =================================================================
        // Project 1 — Website Redesign: 2 top-level threads
        // =================================================================

        // Thread 1: Kick-off notes from PM → replies from Deni and Citra
        $thread1 = $this->post(
            $pm,
            $project1,
            'Kick-off selesai. Kita mulai dari homepage redesign dulu ya. Deni tolong siapkan mockup minggu depan.'
        );

        $this->reply(
            $member2, $project1, $thread1,
            'Siap! Saya akan kirim draft mockup Jumat ini.'
        );

        $this->reply(
            $member1, $project1, $thread1,
            'Kalau mockup sudah fix, saya langsung mulai API integration.'
        );

        // Thread 2: BD gives brand consistency feedback → PM replies
        $thread2 = $this->post(
            $bd,
            $project1,
            'Saya sudah review brief-nya. Pastikan tone visual konsisten dengan brand guideline yang lama ya.'
        );

        $this->reply(
            $pm, $project1, $thread2,
            'Betul. Kita jadwalkan review bersama setelah mockup pertama selesai.'
        );

        // =================================================================
        // Task — API Integration: 1 thread with back-and-forth replies
        // =================================================================

        $thread3 = $this->post(
            $member1, $taskApi,
            'Mulai integrasi hari ini. Pakai REST approach dengan JWT auth.'
        );

        $this->reply(
            $pm, $taskApi, $thread3,
            'Oke. Pastikan handle token refresh dengan benar ya, terutama saat session expired di tengah request.'
        );

        $this->reply(
            $member1, $taskApi, $thread3,
            'Sudah dihandle. Plus saya tambahkan retry logic untuk network error supaya UX-nya lebih mulus.'
        );

        // =================================================================
        // Task — User Testing: 1 thread requesting documentation
        // =================================================================

        $thread4 = $this->post(
            $member3, $taskTesting,
            'Testing session pertama sudah selesai. Ada 3 pain point utama yang perlu diperbaiki segera.'
        );

        $this->reply(
            $pm, $taskTesting, $thread4,
            'Tolong dokumentasikan pain point-nya di sini supaya bisa langsung di-assign ke tim.'
        );

        // =================================================================
        // Project 3 — Brand Identity Refresh: 1 thread involving all roles
        // =================================================================

        $thread5 = $this->post(
            $bd,
            $project3,
            'Riset brand kompetitor sudah selesai. Kesimpulan: kita perlu visual yang lebih modern dan bold.'
        );

        $this->reply(
            $pm, $project3, $thread5,
            'Bagus! Deni, bisa jadikan riset ini sebagai referensi utama untuk konsep logo?'
        );

        $this->reply(
            $member2, $project3, $thread5,
            'Bisa! Saya akan buat 3 konsep berbeda untuk dipresentasikan minggu depan.'
        );
    }

    /**
     * Creates a top-level message (a new thread) on a project or task.
     *
     * @param  \App\Models\User     $author      Who is posting
     * @param  \App\Models\Project|\App\Models\Task  $owner  Where it's posted
     * @param  string               $body        Message content
     */
    private function post(User $author, object $owner, string $body): Message
    {
        return Message::create([
            'user_id'          => $author->id,
            'messageable_type' => get_class($owner),   // e.g. "App\Models\Project"
            'messageable_id'   => $owner->id,
            'parent_id'        => null,                 // null = top-level message
            'body'             => $body,
        ]);
    }

    /**
     * Creates a reply to an existing message (nested thread).
     *
     * @param  \App\Models\User     $author   Who is replying
     * @param  \App\Models\Project|\App\Models\Task  $owner  Same owner as the parent
     * @param  \App\Models\Message  $parent   The message being replied to
     * @param  string               $body     Reply content
     */
    private function reply(User $author, object $owner, Message $parent, string $body): Message
    {
        return Message::create([
            'user_id'          => $author->id,
            'messageable_type' => get_class($owner),
            'messageable_id'   => $owner->id,
            'parent_id'        => $parent->id,  // links to the parent message
            'body'             => $body,
        ]);
    }
}
