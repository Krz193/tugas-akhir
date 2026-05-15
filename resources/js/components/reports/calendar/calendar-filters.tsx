import { router } from '@inertiajs/react';

import { cleanFilters } from './calendar-utils';
import type {
    Filters,
    ProjectOption,
} from './types';


type CalendarFiltersProps = {
    data: Filters;
    setData: React.Dispatch<
        React.SetStateAction<Filters>
    >;
    projects: ProjectOption[];
};

export function CalendarFilters({
    data,
    setData,
    projects,
}: CalendarFiltersProps) {
    function updateFilters(
        nextFilters: Filters,
    ) {
        router.get(
            '/reports/calendar',
            cleanFilters(nextFilters),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <select
                value={data.project_id ?? ''}
                onChange={(event) => {
                    const nextData = {
                        ...data,
                        project_id:
                            event.target.value,
                    };

                    setData(nextData);
                    updateFilters(nextData);
                }}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
                <option value="">
                    All projects
                </option>

                {projects.map((project) => (
                    <option
                        key={project.id}
                        value={project.id}
                    >
                        {project.name}
                    </option>
                ))}
            </select>

            <input
                type="month"
                value={data.month ?? ''}
                onChange={(event) => {
                    const nextData = {
                        ...data,
                        month:
                            event.target.value,
                    };

                    setData(nextData);
                    updateFilters(nextData);
                }}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            />
        </div>
    );
}