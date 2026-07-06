// Bentuk data auth yang dibagikan ke semua halaman.
export type AuthRole = {
    id: number;
    name: string;
    slug: string; // contoh: project-manager
};

export type AuthDivision = {
    id: number;
    name: string;
};

export type AuthEmployee = {
    id: number;
    user_id: number;
    role_id: number;
    division_id: number | null;
    name: string;
    phone?: string | null;
    address?: string | null;
    avatar_url?: string | null;
    role?: AuthRole | null;
    division?: AuthDivision | null;
};

export type User = {
    id: number;
    email: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    employee?: AuthEmployee | null;
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
