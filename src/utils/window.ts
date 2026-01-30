export type { Window } from '@/generated/workspace_pb';
export { WindowSchema } from '@/generated/workspace_pb';
import { create } from '@bufbuild/protobuf';
import type { Window } from '@/generated/workspace_pb';
import { WindowSchema } from '@/generated/workspace_pb';

export function createWindowFromChrome(chromeWindow: chrome.windows.Window): Window {
  return create(WindowSchema, {
    id: chromeWindow.id!,
    focused: chromeWindow.focused ?? false,
    incognito: chromeWindow.incognito ?? false,
  });
}
