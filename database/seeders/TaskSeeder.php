<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Creates tasks across all 3 projects.
     *
     * Strict approved schema: project_id, assigned_employee_id, title,
     * description, status, start_date, due_date.
     *
     * Removed: created_by, priority, completed_at, position.
     */
    public function run(): void
    {
        $bd      = $this->employee('bd@djitugo.test');
        $member1 = $this->employee('member1@djitugo.test'); // Citra
        $member2 = $this->employee('member2@djitugo.test'); // Deni
        $member3 = $this->employee('member3@djitugo.test'); // Eko

        $project1 = Project::where('name', 'Website Redesign')->firstOrFail();
        $project2 = Project::where('name', 'Mobile App Development')->firstOrFail();
        $project3 = Project::where('name', 'Brand Identity Refresh')->firstOrFail();

        // =================================================================
        // Project 1 — Website Redesign (5 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Design Homepage Mockup'],
            [
                'assigned_employee_id' => $member2->id,
                'description'          => 'Create high-fidelity mockups for the new homepage in Figma. Include desktop and mobile versions.',
                'status'               => 'done',
                'start_date'           => '2026-01-15',
                'due_date'             => '2026-02-28',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Implement Navigation Component'],
            [
                'assigned_employee_id' => $member1->id,
                'description'          => 'Build the responsive navigation bar in React based on the approved mockup.',
                'status'               => 'done',
                'start_date'           => '2026-03-01',
                'due_date'             => '2026-03-15',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'API Integration'],
            [
                'assigned_employee_id' => $member1->id,
                'description'          => 'Integrate the backend REST API with the frontend. Includes auth token handling and error states.',
                'status'               => 'in_progress',
                'start_date'           => '2026-03-16',
                'due_date'             => '2026-05-31',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'User Testing'],
            [
                'assigned_employee_id' => $member3->id,
                'description'          => 'Conduct usability testing sessions with 5 internal users. Document findings and pain points.',
                'status'               => 'in_progress',
                'start_date'           => '2026-05-01',
                'due_date'             => '2026-06-15',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project1->id, 'title' => 'Performance Optimization'],
            [
                'assigned_employee_id' => $member1->id,
                'description'          => 'Optimize page load speed. Target: Lighthouse score above 90. Focus on image lazy loading and code splitting.',
                'status'               => 'todo',
                'start_date'           => '2026-06-01',
                'due_date'             => '2026-06-30',
            ],
        );

        // =================================================================
        // Project 2 — Mobile App Development (3 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Define App Architecture'],
            [
                'assigned_employee_id' => $member1->id,
                'description'          => 'Define the overall app architecture: state management, navigation, and data flow patterns.',
                'status'               => 'done',
                'start_date'           => '2026-03-05',
                'due_date'             => '2026-04-15',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Design UI Components'],
            [
                'assigned_employee_id' => $member2->id,
                'description'          => 'Design a reusable component library for the mobile app. Includes buttons, cards, forms, and navigation patterns.',
                'status'               => 'in_progress',
                'start_date'           => '2026-04-16',
                'due_date'             => '2026-05-31',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project2->id, 'title' => 'Implement Login Flow'],
            [
                'assigned_employee_id' => $member1->id,
                'description'          => 'Build the login, registration, and password reset screens with backend authentication integration.',
                'status'               => 'todo',
                'start_date'           => '2026-06-01',
                'due_date'             => '2026-06-30',
            ],
        );

        // =================================================================
        // Project 3 — Brand Identity Refresh (3 tasks)
        // =================================================================

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Brand Research'],
            [
                'assigned_employee_id' => $bd->id,
                'description'          => 'Research competitor brands and current market trends. Summarize key insights for the design team.',
                'status'               => 'done',
                'start_date'           => '2026-04-01',
                'due_date'             => '2026-04-30',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Logo Design'],
            [
                'assigned_employee_id' => $member2->id,
                'description'          => 'Create 3 logo concept options based on brand research findings. Present in next review meeting.',
                'status'               => 'in_progress',
                'start_date'           => '2026-05-01',
                'due_date'             => '2026-05-31',
            ],
        );

        Task::firstOrCreate(
            ['project_id' => $project3->id, 'title' => 'Brand Guidelines Document'],
            [
                'assigned_employee_id' => $bd->id,
                'description'          => 'Compile the full brand guidelines document: typography, color palette, logo usage rules, and tone of voice.',
                'status'               => 'todo',
                'start_date'           => '2026-06-01',
                'due_date'             => '2026-07-15',
            ],
        );
    }

    private function employee(string $email): Employee
    {
        return User::where('email', $email)->firstOrFail()->employee;
    }
}
