import { Link } from '@inertiajs/react';
import { FolderKanban, CheckSquare, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    context?: string | null;
    url?: string | null;
    created_at: string;
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

    function getActivityIcon(type: string) {
        switch (type) {
            case 'project_updated':
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                );

            case 'task_updated':
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                        <CheckSquare className="h-5 w-5" />
                    </div>
                );

            case 'message_posted':
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                );

            default:
                return null;
        }
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
                                    activity.url ?? `${activity.type}-${index}`
                                }
                                className="border-b pb-4 last:border-b-0 last:pb-0"
                            >
                                <Link
                                    href={activity.url ?? '#'}
                                    className="block rounded-lg transition hover:bg-white/5"
                                >
                                    <div className="flex items-start justify-between gap-4 p-3">
                                        <div className="flex items-start gap-4">
                                            {getActivityIcon(activity.type)}

                                            <div className="space-y-1">
                                                <p className="font-medium text-white">
                                                    {activity.title}
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    {activity.description}
                                                </p>

                                                {activity.context && (
                                                    <p className="text-xs text-muted-foreground/70">
                                                        {activity.context}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <span className="shrink-0 text-sm text-muted-foreground">
                                            {formatRelativeDate(
                                                activity.created_at,
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
