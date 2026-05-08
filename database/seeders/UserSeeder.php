<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Creates 5 named users — one per role type, spread across divisions.
     * All passwords are "password" so you can log in easily during development.
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
        // Fetch role and division IDs by slug/code so we're not hardcoding numbers.
        $rolePm     = Role::where('slug', 'project-manager')->firstOrFail();
        $roleBd     = Role::where('slug', 'business-developer')->firstOrFail();
        $roleMember = Role::where('slug', 'team-member')->firstOrFail();

        $eng = Division::where('code', 'ENG')->firstOrFail();
        $mkt = Division::where('code', 'MKT')->firstOrFail();
        $des = Division::where('code', 'DES')->firstOrFail();

        $password = Hash::make('password');

        // -----------------------------------------------------------------
        // Create the 5 users
        // firstOrCreate prevents duplicate emails if seeder is re-run.
        // -----------------------------------------------------------------

        $pm = User::firstOrCreate(
            ['email' => 'pm@djitugo.test'],
            [
                'name'              => 'Andi Pratama',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => $rolePm->id,
                'division_id'       => $eng->id,
            ],
        );

        $bd = User::firstOrCreate(
            ['email' => 'bd@djitugo.test'],
            [
                'name'              => 'Budi Santoso',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => $roleBd->id,
                'division_id'       => $mkt->id,
            ],
        );

        $member1 = User::firstOrCreate(
            ['email' => 'member1@djitugo.test'],
            [
                'name'              => 'Citra Dewi',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => $roleMember->id,
                'division_id'       => $eng->id,
            ],
        );

        $member2 = User::firstOrCreate(
            ['email' => 'member2@djitugo.test'],
            [
                'name'              => 'Deni Firmansyah',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => $roleMember->id,
                'division_id'       => $des->id,
            ],
        );

        $member3 = User::firstOrCreate(
            ['email' => 'member3@djitugo.test'],
            [
                'name'              => 'Eko Nugroho',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => $roleMember->id,
                'division_id'       => $mkt->id,
            ],
        );

        // -----------------------------------------------------------------
        // Assign division leads
        // Rule: lead must be a team-member (not PM) in the same division.
        // We use updateQuietly to skip model events (no policy side effects).
        // -----------------------------------------------------------------

        // Engineering lead → Citra Dewi (member1)
        $eng->updateQuietly(['lead_user_id' => $member1->id]);

        // Design lead → Deni Firmansyah (member2)
        $des->updateQuietly(['lead_user_id' => $member2->id]);

        // Marketing lead → Eko Nugroho (member3)
        $mkt->updateQuietly(['lead_user_id' => $member3->id]);
    }
}
