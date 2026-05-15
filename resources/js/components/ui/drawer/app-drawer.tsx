import { X } from 'lucide-react';
import {
    useEffect,
    useRef,
    type ReactNode,
} from 'react';

type AppDrawerProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
};

export function AppDrawer({
    open,
    onClose,
    children,
    className = '',
}: AppDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!open) return;

            if (
                drawerRef.current &&
                !drawerRef.current.contains(
                    event.target as Node,
                )
            ) {
                onClose();
            }
        }

        document.addEventListener(
            'pointerdown',
            handlePointerDown,
        );

        return () => {
            document.removeEventListener(
                'pointerdown',
                handlePointerDown,
            );
        };
    }, [open, onClose]);

    return (
        <div
            className={`fixed inset-0 z-40 transition ${
                open
                    ? 'pointer-events-auto'
                    : 'pointer-events-none'
            }`}
        >
            <div
                className={`
                    absolute inset-0 bg-background/40
                    transition-opacity
                    ${open ? 'opacity-100' : 'opacity-0'}
                `}
            />

            <div
                ref={drawerRef}
                className={`
                    absolute top-0 right-0
                    h-full w-full max-w-md
                    border-l bg-background shadow-2xl
                    transition-transform duration-300 ease-out
                    ${open
                        ? 'translate-x-0'
                        : 'translate-x-full'}
                    ${className}
                `}
            >
                {children}
            </div>
        </div>
    );
}

type AppDrawerHeaderProps = {
    title: string;
    description?: string;
    onClose: () => void;
};

export function AppDrawerHeader({
    title,
    description,
    onClose,
}: AppDrawerHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 border-b p-6">
            <div>
                <h2 className="text-xl font-semibold">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={onClose}
                className="
                    rounded-md p-1
                    text-muted-foreground
                    hover:bg-muted
                    hover:text-foreground
                "
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}

type AppDrawerSectionProps = {
    title: string;
    children: ReactNode;
};

export function AppDrawerSection({
    title,
    children,
}: AppDrawerSectionProps) {
    return (
        <section>
            <h3 className="mb-3 text-sm font-medium">
                {title}
            </h3>

            {children}
        </section>
    );
}