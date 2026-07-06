import { Link } from '@inertiajs/react';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivity {
    taskTitle: string;
    projectName: string;
    status: string;
    updatedAt: string;
    url?: string | null;
}

interface RecentActivityListProps {
    activities: RecentActivity[];
}

export default function RecentActivityList({
    activities,
}: RecentActivityListProps) {
    function formatRelativeDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();

        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

        return new Intl.RelativeTimeFormat('en', {
            numeric: 'auto',
        }).format(-diffInDays, 'day');
    }

    function getActivityIcon() {
        return (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckSquare className="h-5 w-5" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No recent activities found.
                        </p>
                    ) : (
                        activities.map((activity, index) => (
                            <div
                                key={
                                    activity.url ??
                                    `${activity.taskTitle}-${index}`
                                }
                                className="border-b pb-4 last:border-b-0 last:pb-0"
                            >
                                <Link
                                    href={activity.url ?? '#'}
                                    className="block rounded-lg transition hover:bg-white/5"
                                >
                                    <div className="flex items-start justify-between gap-4 p-3">
                                        <div className="flex items-start gap-4">
                                            {getActivityIcon()}

                                            <div className="space-y-1">
                                                <p className="font-medium text-white">
                                                    {activity.taskTitle}
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    Status: {activity.status}
                                                </p>

                                                <p className="text-xs text-muted-foreground/70">
                                                    {activity.projectName}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="shrink-0 text-sm text-muted-foreground">
                                            {formatRelativeDate(
                                                activity.updatedAt,
                                            )}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
