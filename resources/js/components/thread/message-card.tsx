import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Message } from '@/types/models';

type MessageCardProps = {
    message: Message;
    authUserId: number;
    url: string;
    replyingTo: number | null;
    setReplyingTo: (id: number | null) => void;
    replyBody: string;
    setReplyBody: (value: string) => void;
    editingMessageId: number | null;
    setEditingMessageId: (id: number | null) => void;
    editingBody: string;
    setEditingBody: (value: string) => void;
    errors: Record<string, string>;
    processing: boolean;
    onMessageSent?: () => void;
};

export function MessageCard({
    message,
    authUserId,
    url,
    replyingTo,
    setReplyingTo,
    replyBody,
    setReplyBody,
    editingMessageId,
    setEditingMessageId,
    editingBody,
    setEditingBody,
    errors,
    processing,
    onMessageSent
}: MessageCardProps) {
    return (
        <div key={message.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">
                        {message.author.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        {new Date(
                            message.created_at,
                        ).toLocaleString()}
                    </p>
                </div>

                {message.user_id === authUserId && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                console.log(message.id);
                                setEditingMessageId(message.id);
                                setEditingBody(message.body);
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
                                    }
                                });
                            }}
                            className="text-destructive transition-opacity hover:opacity-70"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {editingMessageId === message.id ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.patch(
                            `/messages/${message.id}`,
                            {
                                body: editingBody,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setEditingMessageId(null);
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
                                setEditingMessageId(null);
                                setEditingBody('');
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
                <p className="mt-3 whitespace-pre-wrap text-sm">
                    {message.body}
                </p>
            )}

            {/* reply system */}
            <div className="mt-3">
                <button
                    type="button"
                    onClick={() =>
                        setReplyingTo(
                            replyingTo === message.id
                                ? null
                                : message.id,
                        )
                    }
                    className="text-sm text-muted-foreground hover:underline"
                >
                    Reply
                </button>
            </div>
            {replyingTo === message.id && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.post(url, {
                                body: replyBody,
                                parent_id: message.id,
                            }, {
                                preserveScroll: true,
                                onSuccess: () => {
                                    setReplyBody('');
                                    setReplyingTo(null);
                                    onMessageSent?.();
                                },
                            }
                        );
                    }}
                    className="mt-3 space-y-3"
                >
                    <textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    {errors.body && (
                        <p className="text-sm text-destructive">
                            {errors.body}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setReplyingTo(null);
                                setReplyBody('');
                            }}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing || !replyBody.trim()}
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            Send Reply
                        </button>
                    </div>
                </form>
            )}

            {message.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l pl-4">
                    {message.replies.map((reply) => (
                        <div
                            key={reply.id}
                            className="rounded-md bg-muted/40 p-3"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {reply.author.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        reply.created_at,
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm">
                                {reply.body}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

