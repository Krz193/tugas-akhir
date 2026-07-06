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
     * Employee — profile data: user_id, role_id, division_id, name, phone, address, avatar_url.
     *
     * Login accounts:
     *   pm@djitugo.test      → Project Manager   (Engineering)
     *   bd@djitugo.test      → Business Developer (Marketing)
     *   member1@djitugo.test → Team Member        (Engineering)
     *   member2@djitugo.test → Team Member        (Design)
     *   member3@djitugo.test → Team Member        (Marketing)
     */
    public function run(): void
    {
        $rolePm     = Role::where('slug', 'project-manager')->firstOrFail();
        $roleBd     = Role::where('slug', 'business-developer')->firstOrFail();
        $roleMember = Role::where('slug', 'team-member')->firstOrFail();

        $eng = Division::where('code', 'ENG')->firstOrFail();
        $mkt = Division::where('code', 'MKT')->firstOrFail();
        $des = Division::where('code', 'DES')->firstOrFail();

        $password = Hash::make('password');

        $accounts = [
            [
                'email'       => 'pm@djitugo.test',
                'name'        => 'Andi Pratama',
                'role_id'     => $rolePm->id,
                'division_id' => $eng->id,
            ],
            [
                'email'       => 'bd@djitugo.test',
                'name'        => 'Budi Santoso',
                'role_id'     => $roleBd->id,
                'division_id' => $mkt->id,
            ],
            [
                'email'       => 'member1@djitugo.test',
                'name'        => 'Citra Dewi',
                'role_id'     => $roleMember->id,
                'division_id' => $eng->id,
            ],
            [
                'email'       => 'member2@djitugo.test',
                'name'        => 'Deni Firmansyah',
                'role_id'     => $roleMember->id,
                'division_id' => $des->id,
            ],
            [
                'email'       => 'member3@djitugo.test',
                'name'        => 'Eko Nugroho',
                'role_id'     => $roleMember->id,
                'division_id' => $mkt->id,
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
