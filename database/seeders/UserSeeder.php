<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Creates 5 users (auth accounts) with a corresponding Employee profile each.
     *
     * User  — authentication data only: email, password, email_verified_at.
     * Employee — profile data: user_id, role_id, division_id, name, phone, address.
     *
     * Login accounts:
     *   pm@djitugo.test      → Project Manager    (Project Management)
     *   bd@djitugo.test      → Business Developer (Business Development)
     *   member1@djitugo.test → Team Member         (Web Development)
     *   member2@djitugo.test → Team Member         (Graphic Design)
     *   member3@djitugo.test → Team Member         (Ads Specialist)
     */
    public function run(): void
    {
        $rolePm     = Role::where('slug', 'project-manager')->firstOrFail();
        $roleBd     = Role::where('slug', 'business-developer')->firstOrFail();
        $roleMember = Role::where('slug', 'team-member')->firstOrFail();

        $pmDivision = Division::where('name', 'Project Management')->firstOrFail();
        $bdDivision = Division::where('name', 'Business Development')->firstOrFail();
        $webDev     = Division::where('name', 'Web Development')->firstOrFail();
        $ads        = Division::where('name', 'Ads Specialist')->firstOrFail();
        $design     = Division::where('name', 'Graphic Design')->firstOrFail();

        $password = Hash::make('password');

        $accounts = [
            [
                'email'       => 'pm@djitugo.test',
                'name'        => 'Andi Pratama',
                'role_id'     => $rolePm->id,
                'division_id' => $pmDivision->id,
            ],
            [
                'email'       => 'bd@djitugo.test',
                'name'        => 'Budi Santoso',
                'role_id'     => $roleBd->id,
                'division_id' => $bdDivision->id,
            ],
            [
                'email'       => 'member1@djitugo.test',
                'name'        => 'Citra Dewi',
                'role_id'     => $roleMember->id,
                'division_id' => $webDev->id,
            ],
            [
                'email'       => 'member2@djitugo.test',
                'name'        => 'Deni Firmansyah',
                'role_id'     => $roleMember->id,
                'division_id' => $design->id,
            ],
            [
                'email'       => 'member3@djitugo.test',
                'name'        => 'Eko Nugroho',
                'role_id'     => $roleMember->id,
                'division_id' => $ads->id,
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'password'          => $password,
                    'email_verified_at' => now(),
                ],
            );

            Employee::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'role_id'     => $account['role_id'],
                    'division_id' => $account['division_id'],
                    'name'        => $account['name'],
                ],
            );
        }
    }
}
