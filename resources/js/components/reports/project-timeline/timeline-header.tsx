import { router } from '@inertiajs/react';
import type { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cleanFilters } from './timeline-utils';
import type { ProjectFilter, TimelineFilters } from './types';

type TimelineHeaderProps = {
    filters: TimelineFilters;
    projectsFilter: ProjectFilter[];
    totalProjects: number;
    currentMonth: Dayjs
    onPrev: () => void
    onNext: () => void
};

export function TimelineHeader({
    filters,
    projectsFilter,
    totalProjects,
    onPrev,
    onNext,
    currentMonth
}: TimelineHeaderProps) {
    const [data, setData] = useState({
        project_id: filters.project_id
            ? String(filters.project_id)
            : '',
    });

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Project Roadmap
                </h1>
                <p className="text-sm text-muted-foreground">
                    {totalProjects} projects across{' '}
                    {currentMonth.format('MMMM YYYY')} and{' '}
                    {currentMonth.add(1, 'month').format('MMMM YYYY')}
                </p>
            </div>

            <div
                className="grid gap-5 sm:grid-cols-[minmax(180px,1fr)_150px_150px_auto]"
            >
                <select
                    value={data.project_id ?? ''}
                    onChange={(event) => {
                        const value = event.target.value;

                        setData((prev) => ({
                            ...prev,
                            project_id: value,
                        }));

                        router.get(
                            '/reports/project-timeline',
                            cleanFilters({
                                ...data,
                                project_id: value,
                            }),
                            {
                                preserveScroll: true,
                                preserveState: true,
                            }
                        );
                    }}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">All projects</option>
                    {projectsFilter.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>

                <div className="flex items-center rounded-md bg-background">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onPrev}
                        className="h-9 w-9 rounded-r-none border"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="whitespace-nowrap px-4 text-sm font-medium">
                        {currentMonth.format('MMM')} - {' '}
                        {currentMonth.add(1, 'month').format('MMM YYYY')}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onNext}
                        className="h-9 w-9 rounded-l-none border"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
