<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Creates 3 company divisions.
     * lead_user_id is left null here — UserSeeder assigns division leads
     * after users exist, because a lead must be a member of the division first.
     */
    public function run(): void
    {
        $divisions = [
            ['name' => 'Engineering', 'code' => 'ENG'],
            ['name' => 'Marketing',   'code' => 'MKT'],
            ['name' => 'Design',      'code' => 'DES'],
        ];

        foreach ($divisions as $division) {
            Division::firstOrCreate(
                ['code' => $division['code']],
                ['name' => $division['name']],
            );
        }
    }
}
