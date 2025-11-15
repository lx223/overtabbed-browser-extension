import React, { createContext, useContext, ReactNode } from 'react';
import type { DragItem, DropTarget } from './DragContext';

export interface WorkspaceActions {
    onSelectTab: (tabId: number, event: React.MouseEvent) => void;
    onCloseTab: (tabId: number) => void;
    onTogglePin: (tabId: number) => void;
    onNavigateTab: (tabId: number) => void;
    onToggleMute: (tabId: number) => void;
    onUngroup: (tabIds: number[]) => void;
    onToggleCollapse: (groupId: number, collapsed: boolean) => void;
    onDrop: (dragItem: DragItem, target: DropTarget) => void;
    onToggleSelectAll: (tabIds: number[], selectAll: boolean) => void;
}

const WorkspaceActionsContext = createContext<WorkspaceActions | null>(null);

interface WorkspaceActionsProviderProps {
    children: ReactNode;
    actions: WorkspaceActions;
}

export function WorkspaceActionsProvider({ children, actions }: WorkspaceActionsProviderProps) {
    return (
        <WorkspaceActionsContext.Provider value={actions}>
            {children}
        </WorkspaceActionsContext.Provider>
    );
}

export function useWorkspaceActions(): WorkspaceActions {
    const context = useContext(WorkspaceActionsContext);
    if (!context) {
        throw new Error('useWorkspaceActions must be used within a WorkspaceActionsProvider');
    }
    return context;
}

