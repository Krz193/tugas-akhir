<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Creates tasks across all 3 projects with a realistic mix of:
     * - Statuses: done, in_progress, todo
     * - Priorities: high, medium, low
     * - Due dates: past (overdue), near future, far future
     *
     * This gives the Timeline, Calendar, and Performance pages real data.
     */
    public function run(): void
    {
        $pm      = User::where('email', 'pm@djitugo.test')->firstOrFail();
        $bd      = User::where('email', 'bd@djitugo.test')->firstOrFail();
        $member1 = User::where('email', 'member1@djitugo.test')->firstOrFail(); // Citra
        $member2 = User::where('email', 'member2@djitugo.test')->firstOrFail(); // Deni
        $member3 = User::where('email', 'member3@djitugo.test')->firstOrFail(); // Eko

        $project1 = Project::where('name', 'Website Redesign')->firstOrFail();
        $project2 = Project::where('name', 'Mobile App Development')->firstOrFail();
        $project3 = Project::where('name', 'Brand Identity Refresh')->firstOrFail();

        // =================================================================
        // Project 1 — Website Redesign (5 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Design Homepage Mockup'],
            [
                'created_by'   => $pm->id,
                'assigned_to'  => $member2->id,  // Deni (designer)
                'description'  => 'Create high-fidelity mockups for the new homepage in Figma. Include desktop and mobile versions.',
                'status'       => 'done',
                'priority'     => 'high',
                'start_date'   => '2026-01-15',
                'due_date'     => '2026-02-28',
                'completed_at' => '2026-02-25 10:00:00',
                'position'     => 1,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Implement Navigation Component'],
            [
                'created_by'   => $pm->id,
                'assigned_to'  => $member1->id,  // Citra (engineer)
                'description'  => 'Build the responsive navigation bar in React based on the approved mockup.',
                'status'       => 'done',
                'priority'     => 'medium',
                'start_date'   => '2026-03-01',
                'due_date'     => '2026-03-15',
                'completed_at' => '2026-03-14 16:30:00',
                'position'     => 2,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'API Integration'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member1->id,  // Citra
                'description' => 'Integrate the backend REST API with the frontend. Includes auth token handling and error states.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'start_date'  => '2026-03-16',
                'due_date'    => '2026-05-31',
                'position'    => 3,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'User Testing'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member3->id,  // Eko
                'description' => 'Conduct usability testing sessions with 5 internal users. Document findings and pain points.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'start_date'  => '2026-05-01',
                'due_date'    => '2026-06-15',
                'position'    => 4,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Performance Optimization'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member1->id,  // Citra
                'description' => 'Optimize page load speed. Target: Lighthouse score above 90. Focus on image lazy loading and code splitting.',
                'status'      => 'todo',
                'priority'    => 'low',
                'start_date'  => '2026-06-01',
                'due_date'    => '2026-06-30',
                'position'    => 5,
            ],
        );

        // =================================================================
        // Project 2 — Mobile App Development (3 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Define App Architecture'],
            [
                'created_by'   => $pm->id,
                'assigned_to'  => $member1->id,  // Citra
                'description'  => 'Define the overall app architecture: state management, navigation, and data flow patterns.',
                'status'       => 'done',
                'priority'     => 'high',
                'start_date'   => '2026-03-05',
                'due_date'     => '2026-04-15',
                'completed_at' => '2026-04-10 14:00:00',
                'position'     => 1,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Design UI Components'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member2->id,  // Deni
                'description' => 'Design a reusable component library for the mobile app. Includes buttons, cards, forms, and navigation patterns.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'start_date'  => '2026-04-16',
                'due_date'    => '2026-05-31',
                'position'    => 2,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Implement Login Flow'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member1->id,  // Citra
                'description' => 'Build the login, registration, and password reset screens with backend authentication integration.',
                'status'      => 'todo',
                'priority'    => 'high',
                'start_date'  => '2026-06-01',
                'due_date'    => '2026-06-30',
                'position'    => 3,
            ],
        );

        // =================================================================
        // Project 3 — Brand Identity Refresh (3 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Brand Research'],
            [
                'created_by'   => $pm->id,
                'assigned_to'  => $bd->id,  // Budi (BD does research)
                'description'  => 'Research competitor brands and current market trends. Summarize key insights for the design team.',
                'status'       => 'done',
                'priority'     => 'medium',
                'start_date'   => '2026-04-01',
                'due_date'     => '2026-04-30',
                'completed_at' => '2026-04-28 09:00:00',
                'position'     => 1,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Logo Design'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $member2->id,  // Deni
                'description' => 'Create 3 logo concept options based on brand research findings. Present in next review meeting.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'start_date'  => '2026-05-01',
                'due_date'    => '2026-05-31',
                'position'    => 2,
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Brand Guidelines Document'],
            [
                'created_by'  => $pm->id,
                'assigned_to' => $bd->id,  // Budi
                'description' => 'Compile the full brand guidelines document: typography, color palette, logo usage rules, and tone of voice.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'start_date'  => '2026-06-01',
                'due_date'    => '2026-07-15',
                'position'    => 3,
            ],
        );
    }
}
