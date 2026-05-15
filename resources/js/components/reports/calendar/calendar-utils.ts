import type { Filters } from './types';

export const weekDays = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
];

export function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

export function cleanFilters(filters: Filters) {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== '' &&
                value !== undefined,
        ),
    );
}

export function monthDays(month: string) {
    const [year, monthNumber] = month
        .split('-')
        .map(Number);

    const firstDate = new Date(
        year,
        monthNumber - 1,
        1,
    );

    const lastDate = new Date(
        year,
        monthNumber,
        0,
    );

    const leadingEmptyDays =
        firstDate.getDay();

    const days = Array.from(
        { length: lastDate.getDate() },
        (_, index) => {
            const day = String(
                index + 1,
            ).padStart(2, '0');

            return `${month}-${day}`;
        },
    );

    const cells = [
        ...Array.from(
            { length: leadingEmptyDays },
            () => null,
        ),
        ...days,
    ];

    const trailingEmptyDays =
        (7 - (cells.length % 7)) % 7;

    return [
        ...cells,
        ...Array.from(
            { length: trailingEmptyDays },
            () => null,
        ),
    ];
}

export function dayLabel(date: string) {
    return Number(date.slice(-2));
}

export function taskBarClass(status: string) {
    if (status === 'done') {
        return 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30';
    }

    if (status === 'in_progress') {
        return 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30';
    }

    if (status === 'pending_review') {
        return 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30';
    }

    return 'bg-zinc-500/20 border-zinc-500/30 hover:bg-zinc-500/30';
}