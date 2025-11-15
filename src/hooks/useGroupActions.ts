import { useCallback } from 'react';
import { groupService } from '@/services/groupService';

export function useGroupActions() {

    const createGroup = useCallback(async (tabIds: number[]) => {
        await groupService.createGroup(tabIds);
    }, []);

    const ungroupTabs = useCallback(async (tabIds: number[]) => {
        await groupService.ungroupTabs(tabIds);
    }, []);

    const addTabToGroup = useCallback(async (tabId: number, groupId: number) => {
        await groupService.addTabToGroup(tabId, groupId);
    }, []);

    const moveGroup = useCallback(async (groupId: number, windowId: number, index?: number) => {
        await groupService.moveGroupToWindow(groupId, windowId, index);
    }, []);

    const toggleGroupCollapse = useCallback(async (groupId: number, collapsed: boolean) => {
        await groupService.updateGroup(groupId, { collapsed });
    }, []);

    return {
        createGroup,
        ungroupTabs,
        addTabToGroup,
        moveGroup,
        toggleGroupCollapse,
    };
}

