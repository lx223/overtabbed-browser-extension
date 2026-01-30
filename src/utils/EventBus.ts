import type { BrowserEventMessage } from '@/generated/event_pb';

type EventHandler = (message: BrowserEventMessage) => void;

class EventBus {
    private subscribers: Set<EventHandler> = new Set();
    private messageListener: ((message: BrowserEventMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) => void) | null = null;

    constructor() {
        if (typeof chrome === 'undefined') {
            return;
        }

        this.messageListener = (message: BrowserEventMessage) => {
            this.notifySubscribers(message);
        };
        chrome.runtime.onMessage.addListener(this.messageListener);
    }


    private notifySubscribers(message: BrowserEventMessage): void {
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

    emit(message: BrowserEventMessage): void {
        this.notifySubscribers(message);

        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage(message).catch(() => { });
        }
    }

    destroy(): void {
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
        this.subscribers.clear();
    }
}

export const eventBus = new EventBus();
export type { BrowserEventMessage };
