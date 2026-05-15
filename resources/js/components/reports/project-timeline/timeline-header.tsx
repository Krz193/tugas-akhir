import { router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cleanFilters } from './timeline-utils';
import type { ProjectFilter, TimelineFilters, TimelineRange } from './types';

type TimelineHeaderProps = {
    filters: TimelineFilters;
    projectsFilter: ProjectFilter[];
    range: TimelineRange;
    totalProjects: number;
};

export function TimelineHeader({
    filters,
    projectsFilter,
    range,
    totalProjects,
}: TimelineHeaderProps) {
    const [data, setData] = useState<TimelineFilters>({
        project_id: filters.project_id ? String(filters.project_id) : '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    function submitFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/reports/project-timeline', cleanFilters(data), {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Project Roadmap
                </h1>
                <p className="text-sm text-muted-foreground">
                    {totalProjects} projects across{' '}
                    {range.months.map((month) => month.label).join(' and ')}
                </p>
            </div>

            <form
                onSubmit={submitFilters}
                className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_150px_150px_auto]"
            >
                <select
                    value={data.project_id ?? ''}
                    onChange={(event) =>
                        setData({ ...data, project_id: event.target.value })
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">All projects</option>
                    {projectsFilter.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={data.start_date ?? ''}
                    onChange={(event) =>
                        setData({ ...data, start_date: event.target.value })
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                />

                <input
                    type="date"
                    value={data.end_date ?? ''}
                    onChange={(event) =>
                        setData({ ...data, end_date: event.target.value })
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                />

                <Button type="submit" variant="secondary">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </form>
        </div>
    );
}
