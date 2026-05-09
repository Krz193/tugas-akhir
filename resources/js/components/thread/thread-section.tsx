import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { Message } from '@/types/models';
import { MessageCard } from './message-card';

type ThreadSectionProps = {
    messages: Message[];
    messageableType: 'project' | 'task';
    messageableId: number;
};

export function ThreadSection({
    messages,
    messageableType,
    messageableId,
}: ThreadSectionProps) {
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyBody, setReplyBody] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingBody, setEditingBody] = useState('');

    const { auth } = usePage<{
        auth: {
            user: {
                id: number;
            };
        };
    }>().props;

    const url = messageableType === 'project' 
                    ? `/projects/${messageableId}/messages`
                    : `/tasks/${messageableId}/messages`;

    const {
        data,
        setData,
        post,
        processing,
        reset,
        transform,
        errors,
    } = useForm({
        body: '',
        parent_id: null as number | null,
    });

    return (
        <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No discussion yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            message={message}
                            authUserId={auth.user.id}
                            url={url}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyBody={replyBody}
                            setReplyBody={setReplyBody}
                            editingMessageId={editingMessageId}
                            setEditingMessageId={setEditingMessageId}
                            editingBody={editingBody}
                            setEditingBody={setEditingBody}
                            errors={errors}
                            processing={processing}
                        />
                    ))}
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    transform((data) => ({
                        ...data,
                        parent_id: null,
                    }));

                    post(url, {
                        preserveScroll: true,
                        onSuccess: () => reset(),
                    });
                }}
                className="space-y-3"
            >
                <textarea
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder="Write a message..."
                    className="flex min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                {errors.body && (
                    <p className="text-sm text-destructive">
                        {errors.body}
                    </p>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || !data.body.trim()}
                        className="rounded-md border px-4 py-2 text-sm"
                    >
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
}