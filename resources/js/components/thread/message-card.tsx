import type { Message, ProjectMessage } from '@/types';

type MessageCardProps = {
    message: Message | ProjectMessage;
    isOwnMessage: boolean;
};

export function MessageCard({ message, isOwnMessage }: MessageCardProps) {
    const senderName = message.sender?.name ?? 'Unknown sender';
    const messageTime = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[65%] ${
                    isOwnMessage
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-muted text-foreground'
                }`}
            >
                {!isOwnMessage && (
                    <p className="mb-1 text-xs font-medium">{senderName}</p>
                )}

                <p className="text-sm break-words whitespace-pre-wrap">
                    {message.message_body}
                </p>

                <p
                    className={`mt-1 text-right text-[11px] ${
                        isOwnMessage
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                    }`}
                >
                    {messageTime}
                </p>
            </div>
        </div>
    );
}
