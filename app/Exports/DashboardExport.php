<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Export;

class DashboardExport implements WithMultipleSheets, Export
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        return [
            new ProjectMetricsSheet(collect($this->data['metricRecords']['totalProject'] ?? [])),
            new TaskMetricsSheet(collect($this->data['metricRecords']['totalTask'] ?? [])),
        ];
    }
}
