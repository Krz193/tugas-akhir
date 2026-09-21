import { useCallback } from 'react';

export type CleanupFn = () => void;

export function useMobileNavigation(): CleanupFn {
    return useCallback(() => {
        // Membersihkan style sementara setelah menu mobile ditutup.
        document.body.style.removeProperty('pointer-events');
    }, []);
}
