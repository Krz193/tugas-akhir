import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import echo from '@/lib/echo';
import type { Message, ProjectMessage } from '@/types/models';
import { MessageCard } from './message-card';

type MessageEvent = {
    message: Message | ProjectMessage;
};

type ThreadSectionProps = {
    messages: Array<Message | ProjectMessage>;
    postUrl: string;
    onMessageSent?: () => void;
    realtimeChannel?: string;
    realtimeEvent?: string;
};

export function ThreadSection({
    messages,
    postUrl,
    onMessageSent,
    realtimeChannel,
    realtimeEvent,
}: ThreadSectionProps) {
    const [visibleMessages, setVisibleMessages] =
        useState<Array<Message | ProjectMessage>>(messages);

    const { data, setData, post, processing, reset, errors } = useForm({
        message_body: '',
    });

    useEffect(() => {
        setVisibleMessages(messages);
    }, [messages]);

    useEffect(() => {
        if (!realtimeChannel || !realtimeEvent) {
            return;
        }

        const channel = echo.private(realtimeChannel);

        channel.listen(realtimeEvent, (event: MessageEvent) => {
            setVisibleMessages((currentMessages) => {
                const messageAlreadyShown = currentMessages.some(
                    (message) => message.id === event.message.id,
                );

                if (messageAlreadyShown) {
                    return currentMessages;
                }

                return [...currentMessages, event.message];
            });
        });

        return () => {
            echo.leave(realtimeChannel);
        };
    }, [realtimeChannel, realtimeEvent]);

    return (
        <div className="space-y-4">
            {visibleMessages.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No discussion yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleMessages.map((message) => (
                        <MessageCard
                            key={message.id}
                            message={message}
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
