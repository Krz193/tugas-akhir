import { router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Message, ProjectMessage, SharedData } from '@/types';

type MessageCardProps = {
    message: Message | ProjectMessage;
    canManageMessages: boolean;
    onMessageSent?: () => void;
};

export function MessageCard({
    message,
    canManageMessages,
    onMessageSent,
}: MessageCardProps) {
    const { auth } = usePage<SharedData>().props;
    const [isEditing, setIsEditing] = useState(false);
    const [editingBody, setEditingBody] = useState(message.message_body);

    const authEmployeeId = auth.user.employee?.id;
    const canEditThisMessage =
        canManageMessages && authEmployeeId === message.sender_id;
    const senderName = message.sender?.name ?? 'Unknown sender';

    return (
        <div key={message.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">{senderName}</p>

                    <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString()}
                    </p>
                </div>

                {canEditThisMessage && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(true);
                                setEditingBody(message.message_body);
                            }}
                            className="transition-opacity hover:opacity-70"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (!confirm('Delete this message?')) {
                                    return;
                                }

                                router.delete(`/messages/${message.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        onMessageSent?.();
                                    },
                                });
                            }}
                            className="text-destructive transition-opacity hover:opacity-70"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.patch(
                            `/messages/${message.id}`,
                            {
                                message_body: editingBody,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setIsEditing(false);
                                    setEditingBody('');
                                    onMessageSent?.();
                                },
                            },
                        );
                    }}
                    className="mt-3 space-y-3"
                >
                    <textarea
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        className="flex min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setEditingBody(message.message_body);
                            }}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!editingBody.trim()}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <p className="mt-3 text-sm whitespace-pre-wrap">
                    {message.message_body}
                </p>
            )}
        </div>
    );
}
