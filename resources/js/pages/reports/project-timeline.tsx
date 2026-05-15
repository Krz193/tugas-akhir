import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { TimelineDrawer } from '@/components/reports/project-timeline/timeline-drawer';
import { TimelineGrid } from '@/components/reports/project-timeline/timeline-grid';
import { TimelineHeader } from '@/components/reports/project-timeline/timeline-header';
import { buildTimelineRange } from '@/components/reports/project-timeline/timeline-utils';
import type {
    ProjectFilter,
    TimelineFilters,
    TimelineProject,
} from '@/components/reports/project-timeline/types';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    projects: TimelineProject[];
    projectsFilter: ProjectFilter[];
    filters: TimelineFilters;
    totalProjects: number;
    currentMonth: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports/project-timeline' },
    { title: 'Project Timeline', href: '/reports/project-timeline' },
];

export default function ProjectTimeline({
    projects,
    projectsFilter,
    filters,
    totalProjects,
}: Props) {
    const [selectedProject, setSelectedProject] = useState<TimelineProject | null>(null);
    const [currentMonth, setCurrentMonth] = useState(
        dayjs(filters.month ?? dayjs().format('YYYY-MM'))
    );
    
    const range = useMemo(
        () => buildTimelineRange(currentMonth),
        [currentMonth]
    );

    const handlePrevRange = () => {
        const nextMonth = currentMonth.subtract(2, 'month');

        setCurrentMonth(nextMonth);

        router.get(
            '/reports/project-timeline',
            {
                ...filters,
                month: nextMonth.format('YYYY-MM'),
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleNextRange = () => {
        const nextMonth = currentMonth.add(2, 'month');

        setCurrentMonth(nextMonth);

        router.get(
            '/reports/project-timeline',
            {
                ...filters,
                month: nextMonth.format('YYYY-MM'),
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Timeline" />

            <div className="flex flex-col gap-6 p-4">
                <TimelineHeader
                    filters={filters}
                    projectsFilter={projectsFilter}
                    totalProjects={totalProjects}
                    currentMonth={currentMonth}
                    onPrev={handlePrevRange}
                    onNext={handleNextRange}
                />

                <TimelineGrid
                    projects={projects}
                    range={range}
                    onSelect={setSelectedProject}
                />
            </div>

            <TimelineDrawer
                project={selectedProject}
                open={selectedProject !== null}
                onClose={() => setSelectedProject(null)}
            />
        </AppLayout>
    );
}
