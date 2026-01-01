import type {
    TabEventMessage,
    TabGroupEventMessage,
    WindowEventMessage,
} from './eventTypes';

export type EventMessage = TabEventMessage | TabGroupEventMessage | WindowEventMessage;

type EventHandler = (message: EventMessage) => void;

class EventBus {
    private subscribers: Set<EventHandler> = new Set();
    private messageListener: (message: any) => void = (message: any) => {
        if (!this.isEventMessage(message)) {
            return;
        }
        this.notifySubscribers(message);
    };

    constructor() {
        if (typeof chrome === 'undefined') {
            return;
        }

        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    private isEventMessage(message: any): message is EventMessage {
        return (
            message &&
            typeof message === 'object' &&
            'type' in message &&
            typeof message.type === 'string'
        );
    }

    private notifySubscribers(message: EventMessage): void {
        this.subscribers.forEach((handler) => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in event handler:', error);
            }
        });
    }

    subscribe(handler: EventHandler): () => void {
        this.subscribers.add(handler);
        return () => {
            this.subscribers.delete(handler);
        };
    }

    unsubscribe(handler: EventHandler): void {
        this.subscribers.delete(handler);
    }

    emit(message: EventMessage): void {
        this.notifySubscribers(message);

        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage(message).catch(() => {
                // Ignore errors when no listeners (e.g., popup closed)
            });
        }
    }

    destroy(): void {
        chrome.runtime.onMessage.removeListener(this.messageListener);
        this.subscribers.clear();
    }
}

export const eventBus = new EventBus();
