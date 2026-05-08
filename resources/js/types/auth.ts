// Role and Division are imported from models.ts via the barrel export,
// but to avoid circular imports we inline the minimal shapes here.
export type AuthRole = {
    id: number;
    name: string;
    slug: string; // 'project-manager' | 'business-developer' | 'team-member'
};

export type AuthDivision = {
    id: number;
    name: string;
    lead_user_id: number | null;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    // role and division are now always present because HandleInertiaRequests
    // eager-loads them before sharing the user with every Inertia response.
    role: AuthRole;
    division: AuthDivision;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
