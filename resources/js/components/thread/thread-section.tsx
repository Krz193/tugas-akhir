import { useForm } from '@inertiajs/react';
import type { Message, ProjectMessage } from '@/types/models';
import { MessageCard } from './message-card';

type ThreadSectionProps = {
    messages: Array<Message | ProjectMessage>;
    postUrl: string;
    canManageMessages: boolean;
    onMessageSent?: () => void;
};

export function ThreadSection({
    messages,
    postUrl,
    canManageMessages,
    onMessageSent,
}: ThreadSectionProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        message_body: '',
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
                            canManageMessages={canManageMessages}
                            onMessageSent={onMessageSent}
                        />
                    ))}
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    post(postUrl, {
                        preserveScroll: true,
                        onSuccess: () => {
                            reset();
                            onMessageSent?.();
                        },
                    });
                }}
                className="space-y-3"
            >
                <textarea
                    value={data.message_body}
                    onChange={(e) => setData('message_body', e.target.value)}
                    placeholder="Write a message..."
                    className="flex min-h-16 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                {errors.message_body && (
                    <p className="text-sm text-destructive">
                        {errors.message_body}
                    </p>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || !data.message_body.trim()}
                        className="rounded-md border px-4 py-2 text-sm"
                    >
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
}
