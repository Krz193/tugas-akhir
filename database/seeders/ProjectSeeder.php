<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Creates 3 projects and assigns members (employees only — PM is not a project member).
     *
     * Project 1 — Website Redesign      (active,   BD + 3 members; member1 is leader)
     * Project 2 — Mobile App Dev        (planning, 2 members; member1 is leader)
     * Project 3 — Brand Identity Refresh(active,   BD + 1 member; member3 is leader)
     *
     * Rules:
     * - The Project Manager oversees projects globally and is NOT inserted into project_members.
     * - is_leader is assigned to one Team Member per project.
     * - BD may be a project member but is not eligible as leader (not a Team Member).
     */
    public function run(): void
    {
        $bd      = $this->employee('bd@djitugo.test');
        $member1 = $this->employee('member1@djitugo.test'); // Citra
        $member2 = $this->employee('member2@djitugo.test'); // Deni
        $member3 = $this->employee('member3@djitugo.test'); // Eko

        // -----------------------------------------------------------------
        // Project 1: Website Redesign
        // -----------------------------------------------------------------
        $project1 = Project::firstOrCreate(
            ['name' => 'Website Redesign'],
            [
                'description' => 'Redesign the company website with modern UI/UX, improved performance, and mobile-first approach.',
                'status'      => 'active',
                'start_date'  => '2026-01-10',
                'due_date'    => '2026-06-30',
            ],
        );

        $this->addMembers($project1, [
            ['employee' => $bd,      'is_leader' => false, 'date_joined' => '2026-01-10'],
            ['employee' => $member1, 'is_leader' => true,  'date_joined' => '2026-01-10'],
            ['employee' => $member2, 'is_leader' => false, 'date_joined' => '2026-01-10'],
            ['employee' => $member3, 'is_leader' => false, 'date_joined' => '2026-01-10'],
        ]);

        // -----------------------------------------------------------------
        // Project 2: Mobile App Development
        // -----------------------------------------------------------------
        $project2 = Project::firstOrCreate(
            ['name' => 'Mobile App Development'],
            [
                'description' => 'Build a cross-platform mobile app for internal task tracking and team communication.',
                'status'      => 'planning',
                'start_date'  => '2026-03-01',
                'due_date'    => '2026-09-30',
            ],
        );

        $this->addMembers($project2, [
            ['employee' => $member1, 'is_leader' => true,  'date_joined' => '2026-03-01'],
            ['employee' => $member2, 'is_leader' => false, 'date_joined' => '2026-03-01'],
        ]);

        // -----------------------------------------------------------------
        // Project 3: Brand Identity Refresh
        // -----------------------------------------------------------------
        $project3 = Project::firstOrCreate(
            ['name' => 'Brand Identity Refresh'],
            [
                'description' => 'Refresh the company brand identity including logo, color palette, and visual guidelines.',
                'status'      => 'active',
                'start_date'  => '2026-04-01',
                'due_date'    => '2026-07-31',
            ],
        );

        $this->addMembers($project3, [
            ['employee' => $bd,      'is_leader' => false, 'date_joined' => '2026-04-01'],
            ['employee' => $member3, 'is_leader' => true,  'date_joined' => '2026-04-01'],
        ]);
    }

    /**
     * @param  array<int, array{employee: Employee, is_leader: bool, date_joined: string}>  $entries
     */
    private function addMembers(Project $project, array $entries): void
    {
        foreach ($entries as $entry) {
            ProjectMember::firstOrCreate(
                [
                    'project_id'  => $project->id,
                    'employee_id' => $entry['employee']->id,
                ],
                [
                    'is_leader'   => $entry['is_leader'],
                    'date_joined' => $entry['date_joined'],
                ],
            );
        }
    }

    private function employee(string $email): Employee
    {
        return User::where('email', $email)->firstOrFail()->employee;
    }
}
