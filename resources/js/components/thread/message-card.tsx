import type { Message, ProjectMessage } from '@/types';

type MessageCardProps = {
    message: Message | ProjectMessage;
};

export function MessageCard({ message }: MessageCardProps) {
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
            </div>

            <p className="mt-3 text-sm whitespace-pre-wrap">
                {message.message_body}
            </p>
        </div>
    );
}
