// =============================================================================
// use-auth-user.ts — Hook to access the currently logged-in user + role helpers
//
// Instead of writing `auth.user.role.slug === 'project-manager'` everywhere,
// you import this hook and call `isProjectManager()` — much easier to read.
//
// Usage example:
//   const { user, isProjectManager } = useAuthUser();
//   if (isProjectManager()) { /* show create button */ }
// =============================================================================

import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuthUser() {
    // usePage() gives access to all data that Laravel shares via Inertia.
    // SharedData includes `auth.user` which now carries role + division.
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Role slug constants — avoids typos when comparing role strings.
    const ROLE_PM = 'project-manager';
    const ROLE_BD = 'business-developer';
    const ROLE_MEMBER = 'team-member';

    return {
        // The full authenticated user object
        user,

        // Returns true if the current user is a Project Manager
        isProjectManager: () => user.role?.slug === ROLE_PM,

        // Returns true if the current user is a Business Developer
        isBusinessDeveloper: () => user.role?.slug === ROLE_BD,

        // Returns true if the current user is a Team Member
        isTeamMember: () => user.role?.slug === ROLE_MEMBER,

        // The raw role slug — use sparingly, prefer the helpers above
        roleSlug: user.role?.slug ?? null,
    };
}
