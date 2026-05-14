import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type {
    AvailableUser,
    ProjectFormData,
} from '@/types/project';

type Props = {
    data: ProjectFormData;
    setData: (
        key: keyof ProjectFormData,
        value: string | number[]
    ) => void;
    errors: Record<string, string>;
    processing: boolean;
    availableUsers: AvailableUser[];
    submitLabel: string;
};

export default function ProjectForm({
    data,
    setData,
    errors,
    processing,
    availableUsers,
    submitLabel,
}: Props) {
    const groupedUsers = availableUsers.reduce(
        (groups, user) => {
            const divisionName =
                user.division?.name ?? 'No Division';

            if (!groups[divisionName]) {
                groups[divisionName] = [];
            }

            groups[divisionName].push(user);

            return groups;
        },
        {} as Record<string, AvailableUser[]>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">
                    Project Name{' '}
                    <span className="text-destructive">*</span>
                </Label>

                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) =>
                        setData('name', e.target.value)
                    }
                    placeholder="e.g. Website Redesign"
                    disabled={processing}
                />

                <InputError message={errors.name} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">
                    Description
                </Label>

                <textarea
                    id="description"
                    rows={3}
                    value={data.description}
                    onChange={(e) =>
                        setData('description', e.target.value)
                    }
                    placeholder="What is this project about?"
                    disabled={processing}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <InputError message={errors.description} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="start_date">
                        Start Date
                    </Label>

                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) =>
                            setData(
                                'start_date',
                                e.target.value
                            )
                        }
                        disabled={processing}
                    />

                    <InputError
                        message={errors.start_date}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="due_date">
                        Due Date
                    </Label>

                    <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(e) =>
                            setData(
                                'due_date',
                                e.target.value
                            )
                        }
                        disabled={processing}
                    />

                    <InputError message={errors.due_date} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Project Members</Label>

                <div className="max-h-48 space-y-4 overflow-y-auto rounded-md border p-3">
                    {Object.entries(groupedUsers).map(
                        ([divisionName, users]) => (
                            <div
                                key={divisionName}
                                className="space-y-2"
                            >
                                <p className="text-sm font-medium text-muted-foreground">
                                    {divisionName}
                                </p>

                                <div className="space-y-2 pl-2">
                                    {users.map((user) => (
                                        <label
                                            key={user.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={data.member_ids.includes(
                                                    user.id
                                                )}
                                                onChange={(e) => {
                                                    if (
                                                        e.target
                                                            .checked
                                                    ) {
                                                        setData(
                                                            'member_ids',
                                                            [
                                                                ...data.member_ids,
                                                                user.id,
                                                            ]
                                                        );
                                                    } else {
                                                        setData(
                                                            'member_ids',
                                                            data.member_ids.filter(
                                                                (
                                                                    id
                                                                ) =>
                                                                    id !==
                                                                    user.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />

                                            <span>
                                                {user.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>

                <InputError
                    message={errors.member_ids}
                />
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                >
                    {processing && <Spinner />}
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}