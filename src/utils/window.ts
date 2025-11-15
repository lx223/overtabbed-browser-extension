export type { Window } from '@/generated/window_pb';
export { WindowSchema, Window_WindowTypeSchema, Window_WindowStateSchema, Window_WindowType, Window_WindowState } from '@/generated/window_pb';
import { create } from '@bufbuild/protobuf';
import type { Window } from '@/generated/window_pb';
import { WindowSchema, Window_WindowType, Window_WindowState } from '@/generated/window_pb';

function chromeWindowTypeToProtoType(type: chrome.windows.WindowType | undefined): Window_WindowType | undefined {
  if (!type) return undefined;
  const typeMap: Record<string, Window_WindowType> = {
    normal: Window_WindowType.NORMAL,
    popup: Window_WindowType.POPUP,
    panel: Window_WindowType.PANEL,
    app: Window_WindowType.APP,
    devtools: Window_WindowType.DEVTOOLS,
  };
  return typeMap[type] ?? Window_WindowType.UNSPECIFIED;
}

function chromeWindowStateToProtoState(state: chrome.windows.WindowState | undefined): Window_WindowState | undefined {
  if (!state) return undefined;
  const stateMap: Record<string, Window_WindowState> = {
    normal: Window_WindowState.NORMAL,
    minimized: Window_WindowState.MINIMIZED,
    maximized: Window_WindowState.MAXIMIZED,
    fullscreen: Window_WindowState.FULLSCREEN,
    'locked-fullscreen': Window_WindowState.LOCKED_FULLSCREEN,
  };
  return stateMap[state] ?? Window_WindowState.UNSPECIFIED;
}

export function createWindowFromChrome(chromeWindow: chrome.windows.Window): Window {
  return create(WindowSchema, {
    id: chromeWindow.id!,
    focused: chromeWindow.focused ?? false,
    incognito: chromeWindow.incognito ?? false,
    type: chromeWindowTypeToProtoType(chromeWindow.type as chrome.windows.WindowType | undefined),
    state: chromeWindowStateToProtoState(chromeWindow.state as chrome.windows.WindowState | undefined),
  });
}

