import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type Division = {
    id: number;
    name: string;
};

type Employee = {
    id: number;
    name: string;
    role_id: number;
    division_id: number;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    role: Role | null;
    division: Division | null;
};

type ManagedUser = {
    id: number;
    email: string;
    employee: Employee | null;
};

type UserFormData = {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
    role_id: string;
    division_id: string;
    phone: string;
    address: string;
    avatar_url: string;
};

type Props = {
    users: ManagedUser[];
    roles: Role[];
    divisions: Division[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

function emptyForm(): UserFormData {
    return {
        email: '',
        password: '',
        password_confirmation: '',
        name: '',
        role_id: '',
        division_id: '',
        phone: '',
        address: '',
        avatar_url: '',
    };
}

function formFromUser(user: ManagedUser): UserFormData {
    return {
        email: user.email,
        password: '',
        password_confirmation: '',
        name: user.employee?.name ?? '',
        role_id: user.employee?.role_id?.toString() ?? '',
        division_id: user.employee?.division_id?.toString() ?? '',
        phone: user.employee?.phone ?? '',
        address: user.employee?.address ?? '',
        avatar_url: user.employee?.avatar_url ?? '',
    };
}

function UserFormDialog({
    open,
    onOpenChange,
    roles,
    divisions,
    user,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
    divisions: Division[];
    user?: ManagedUser;
}) {
    const isEditing = user !== undefined;
    const { data, setData, post, patch, processing, errors, reset } =
        useForm<UserFormData>(user ? formFromUser(user) : emptyForm());

    function closeDialog() {
        reset();
        onOpenChange(false);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const options = {
            onSuccess: closeDialog,
        };

        if (isEditing) {
            patch(`/users/${user.id}`, options);
            return;
        }

        post('/users', options);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Create User'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="role_id">Role</Label>
                            <select
                                id="role_id"
                                value={data.role_id}
                                onChange={(event) =>
                                    setData('role_id', event.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.role_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="division_id">Division</Label>
                            <select
                                id="division_id"
                                value={data.division_id}
                                onChange={(event) =>
                                    setData('division_id', event.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="">Select division</option>
                                {divisions.map((division) => (
                                    <option
                                        key={division.id}
                                        value={division.id}
                                    >
                                        {division.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.division_id} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {isEditing ? 'New Password' : 'Password'}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(event) =>
                                setData('address', event.target.value)
                            }
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                            id="avatar_url"
                            value={data.avatar_url}
                            onChange={(event) =>
                                setData('avatar_url', event.target.value)
                            }
                        />
                        <InputError message={errors.avatar_url} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function UserRow({
    user,
    onEdit,
}: {
    user: ManagedUser;
    onEdit: (user: ManagedUser) => void;
}) {
    function deleteUser() {
        if (! window.confirm('Delete this user?')) {
            return;
        }

        router.delete(`/users/${user.id}`);
    }

    return (
        <tr className="border-b">
            <td className="px-4 py-3 font-medium">
                {user.employee?.name ?? 'No employee profile'}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
            <td className="px-4 py-3">
                {user.employee?.role?.name ?? 'No role'}
            </td>
            <td className="px-4 py-3">
                {user.employee?.division?.name ?? 'No division'}
            </td>
            <td className="px-4 py-3 text-muted-foreground">
                {user.employee?.phone || '-'}
            </td>
            <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                {user.employee?.address || '-'}
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(user)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={deleteUser}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export default function UsersIndex({ users, roles, divisions }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Create User
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-5xl text-sm">
                        <thead className="bg-muted text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">
                                    Email
                                </th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">
                                    Division
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Phone
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Address
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onEdit={setEditingUser}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                roles={roles}
                divisions={divisions}
            />

            {editingUser && (
                <UserFormDialog
                    key={editingUser.id}
                    open={editingUser !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingUser(null);
                        }
                    }}
                    roles={roles}
                    divisions={divisions}
                    user={editingUser}
                />
            )}
        </AppLayout>
    );
}
