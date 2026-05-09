// use-auth-user.ts — Returns the current user and simple role-check helpers.
// Usage: const { user, isProjectManager } = useAuthUser();

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuthUser() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return {
        user,
        isProjectManager: () => user.role?.slug === 'project-manager',
        isBusinessDeveloper: () => user.role?.slug === 'business-developer',
        isTeamMember: () => user.role?.slug === 'team-member',
        roleSlug: user.role?.slug ?? null,
    };
}
