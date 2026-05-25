import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStatCardProps {
    title: string;
    value: number;
    description: string;
}

export default function DashboardStatCard({
    title,
    value,
    description,
}: DashboardStatCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-3xl font-bold">{value}</div>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
