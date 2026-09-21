<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProjectMetricsSheet implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    protected $projects;

    public function __construct(Collection $projects)
    {
        $this->projects = $projects;
    }

    public function collection(): Enumerable
    {
        return $this->projects;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Status',
            'Start Date',
            'Due Date',
            'URL',
        ];
    }

    public function map(mixed $project): array
    {
        return [
            $project['id'] ?? '',
            $project['name'] ?? '',
            $project['status'] ?? '',
            $project['startDate'] ?? '',
            $project['dueDate'] ?? '',
            $project['url'] ?? '',
        ];
    }

    public function title(): string
    {
        return 'Projects';
    }
}
