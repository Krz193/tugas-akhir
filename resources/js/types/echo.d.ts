import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';

declare global {
    interface Window {
        Echo?: Echo<'reverb'>;
        Pusher: typeof Pusher;
    }
}
