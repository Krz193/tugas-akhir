import { ThreadSection } from '@/components/thread/thread-section';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { Spinner } from '@/components/ui/spinner';

import type { Message, Task } from '@/types';

type TaskThreadSheetProps = {
    task: Task | null;
    messages: Message[];
    open: boolean;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onMessageSent: () => void;
};

export function TaskThreadSheet({
    task,
    messages,
    open,
    loading,
    onOpenChange,
    onMessageSent,
}: TaskThreadSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto p-5 sm:max-w-2xl">
                <SheetHeader>
                    <SheetTitle className="text-2xl">
                        {task?.title}
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {task?.description && (
                        <div>
                            <h3 className="text-sm font-medium">
                                Description
                            </h3>

                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                {task.description}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium">
                                Discussion
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Task discussion thread.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Spinner />
                            </div>
                        ) : (
                            task && (
                                <ThreadSection
                                    messages={messages}
                                    messageableType="task"
                                    messageableId={task.id}
                                    onMessageSent={onMessageSent}
                                />
                            )
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}