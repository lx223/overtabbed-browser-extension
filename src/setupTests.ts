import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

const createMockStorage = () => {
  let store: Record<string, unknown> = {};
  return {
    get: vi.fn((keys: string[], callback: (result: Record<string, unknown>) => void) => {
      const result: Record<string, unknown> = {};
      keys.forEach((key) => {
        if (store[key] !== undefined) {
          result[key] = store[key];
        }
      });
      callback(result);
    }),
    set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
      Object.assign(store, items);
      callback?.();
    }),
    clear: () => {
      store = {};
    },
  };
};

const mockStorage = createMockStorage();

globalThis.chrome = {
  tabs: {
    query: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    move: vi.fn(),
    duplicate: vi.fn(),
    discard: vi.fn(),
    get: vi.fn(),
    group: vi.fn(),
    ungroup: vi.fn(),
    onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
    onCreated: { addListener: vi.fn(), removeListener: vi.fn() },
    onRemoved: { addListener: vi.fn(), removeListener: vi.fn() },
    onActivated: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabGroups: {
    query: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
    onUpdated: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  windows: {
    getAll: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
    onCreated: { addListener: vi.fn(), removeListener: vi.fn() },
    onRemoved: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    sendMessage: vi.fn().mockResolvedValue(undefined),
    lastError: undefined,
    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id/${path}`),
  },
  storage: {
    sync: mockStorage,
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  action: {
    onClicked: { addListener: vi.fn() },
  },
  commands: {
    onCommand: { addListener: vi.fn() },
  },
} as unknown as typeof chrome;

export { mockStorage };
