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
            ['name' => 'Project Management'],
            ['name' => 'Business Development'],
            ['name' => 'Web Development'],
            ['name' => 'Graphic Design'],
            ['name' => 'Ads Specialist'],
            ['name' => 'Content & Copywriting'],
            ['name' => 'Social Media Marketing'],
        ];

        foreach ($divisions as $division) {
            Division::firstOrCreate(
                ['name' => $division['name']],
            );
        }
    }
}
