import type { CalendarDay, TaskStatus } from '@/types';

import { dayLabel, monthDays, taskBarClass, weekDays } from './calendar-utils';

type CalendarGridProps = {
    month: string;
    days: CalendarDay[];
    onSelectDay: (day: CalendarDay) => void;
};

export function CalendarGrid({ month, days, onSelectDay }: CalendarGridProps) {
    const tasksByDate = new Map(days.map((day) => [day.date, day.tasks]));

    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-7 border-b bg-muted/20">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-medium text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {monthDays(month).map((date, index) => {
                    const tasks = date ? (tasksByDate.get(date) ?? []) : [];

                    return (
                        <div
                            key={date ?? `empty-${index}`}
                            role={date ? 'button' : undefined}
                            className="min-h-24 cursor-pointer border-r border-b p-2 transition-colors last:border-r-0 hover:bg-muted/20"
                            onClick={() => {
                                if (!date) return;

                                onSelectDay({
                                    date,
                                    tasks,
                                });
                            }}
                        >
                            {date && (
                                <div className="flex h-full flex-col">
                                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                                        {dayLabel(date)}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-1">
                                        {tasks.slice(0, 2).map((task) => (
                                            <button
                                                key={task.id}
                                                type="button"
                                                className={`cursor-pointer rounded-md border px-2 py-1.5 text-left transition-colors ${taskBarClass(task.status as TaskStatus)} `}
                                            >
                                                <p className="truncate text-xs font-medium">
                                                    {task.title}
                                                </p>
                                            </button>
                                        ))}

                                        {tasks.length > 2 && (
                                            <div className="px-1 pt-1 text-xs text-muted-foreground">
                                                +{tasks.length - 2} more tasks
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
