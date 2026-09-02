<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;

class TaskMetricsSheet implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    protected $tasks;

    public function __construct(Collection $tasks)
    {
        $this->tasks = $tasks;
    }

    public function collection(): Enumerable
    {
        return $this->tasks;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Project Name',
            'Task Title',
            'Status',
            'Assignee',
            'Due Date',
        ];
    }

    public function map(mixed $task): array
    {
        return [
            $task['id'] ?? '',
            $task['projectName'] ?? '',
            $task['title'] ?? '',
            $task['status'] ?? '',
            $task['assigneeName'] ?? '',
            $task['dueDate'] ?? '',
        ];
    }

    public function title(): string
    {
        return 'Tasks';
    }
}
