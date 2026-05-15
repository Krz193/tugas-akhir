import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { CalendarFilters } from '@/components/reports/calendar/calendar-filters';
import { CalendarGrid } from '@/components/reports/calendar/calendar-grid';

import { currentMonth } from '@/components/reports/calendar/calendar-utils';

import type {
    CalendarReportProps,
    Filters,
} from '@/components/reports/calendar/types';

import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports/calendar',
    },
    {
        title: 'Calendar',
        href: '/reports/calendar',
    },
];

export default function CalendarReport({
    days,
    projects,
    filters,
    daysWithTasks,
    totalTasks,
}: CalendarReportProps) {
    const [data, setData] =
        useState<Filters>({
            project_id:
                filters.project_id
                    ? String(
                        filters.project_id,
                    ) : '',
            month:
                filters.month ??
                currentMonth(),
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar Report" />

            <div className="flex flex-col gap-6 p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">
                        Calendar
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        {totalTasks} dated tasks on{' '}
                        {daysWithTasks} days
                    </p>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="lg:w-72 lg:shrink-0">
                        <CalendarFilters
                            data={data}
                            setData={setData}
                            projects={projects}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <CalendarGrid
                            month={
                                data.month ??
                                currentMonth()
                            }
                            days={days}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}