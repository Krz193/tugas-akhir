<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Creates 3 projects with different statuses and member sets.
     * All projects are created by the PM (Andi Pratama).
     *
     * Project 1 — Website Redesign      (active,   all 5 users)
     * Project 2 — Mobile App Dev        (planning, PM + 2 members)
     * Project 3 — Brand Identity Refresh(active,   PM + BD + 1 member)
     */
    public function run(): void
    {
        $pm      = User::where('email', 'pm@djitugo.test')->firstOrFail();
        $bd      = User::where('email', 'bd@djitugo.test')->firstOrFail();
        $member1 = User::where('email', 'member1@djitugo.test')->firstOrFail(); // Citra
        $member2 = User::where('email', 'member2@djitugo.test')->firstOrFail(); // Deni
        $member3 = User::where('email', 'member3@djitugo.test')->firstOrFail(); // Eko

        // -----------------------------------------------------------------
        // Project 1: Website Redesign
        // Large project, everyone is involved.
        // -----------------------------------------------------------------
        $project1 = Project::firstOrCreate(
            ['name' => 'Website Redesign'],
            [
                'created_by'  => $pm->id,
                'description' => 'Redesign the company website with modern UI/UX, improved performance, and mobile-first approach.',
                'status'      => 'active',
                'start_date'  => '2026-01-10',
                'due_date'    => '2026-06-30',
            ],
        );

        $this->addMembers($project1, $pm, [$bd, $member1, $member2, $member3], '2026-01-10');

        // -----------------------------------------------------------------
        // Project 2: Mobile App Development
        // Still in planning, smaller team.
        // -----------------------------------------------------------------
        $project2 = Project::firstOrCreate(
            ['name' => 'Mobile App Development'],
            [
                'created_by'  => $pm->id,
                'description' => 'Build a cross-platform mobile app for internal task tracking and team communication.',
                'status'      => 'planning',
                'start_date'  => '2026-03-01',
                'due_date'    => '2026-09-30',
            ],
        );

        $this->addMembers($project2, $pm, [$member1, $member2], '2026-03-01');

        // -----------------------------------------------------------------
        // Project 3: Brand Identity Refresh
        // Marketing/design focused, BD is heavily involved.
        // -----------------------------------------------------------------
        $project3 = Project::firstOrCreate(
            ['name' => 'Brand Identity Refresh'],
            [
                'created_by'  => $pm->id,
                'description' => 'Refresh the company brand identity including logo, color palette, and visual guidelines.',
                'status'      => 'active',
                'start_date'  => '2026-04-01',
                'due_date'    => '2026-07-31',
            ],
        );

        $this->addMembers($project3, $pm, [$bd, $member3], '2026-04-01');
    }

    /**
     * Adds a list of users to a project as members.
     *
     * @param  \App\Models\Project  $project   The project to add members to
     * @param  \App\Models\User     $pm        The PM who is adding members (added_by)
     * @param  \App\Models\User[]   $members   Users to add (excluding the PM creator)
     * @param  string               $joinedAt  ISO date when they joined
     */
    private function addMembers(Project $project, User $pm, array $members, string $joinedAt): void
    {
        foreach ($members as $member) {
            ProjectMember::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'user_id'    => $member->id,
                ],
                [
                    'added_by'  => $pm->id,
                    'joined_at' => $joinedAt,
                ],
            );
        }
    }
}
