// Mengambil user login dan pengecekan role.

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuthUser() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return {
        user,
        isProjectManager: () =>
            user.employee?.role?.slug === 'project-manager',
        isBusinessDeveloper: () =>
            user.employee?.role?.slug === 'business-developer',
        isTeamMember: () => user.employee?.role?.slug === 'team-member',
        roleSlug: user.employee?.role?.slug ?? null,
    };
}
