<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Creates 3 company divisions.
     * Role and division assignment happens on Employee records.
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
