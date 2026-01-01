import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type DragItemType = 'tab' | 'group';

export interface DragItem {
  type: DragItemType;
  id: number;
  windowId: number;
  groupId?: number;
  index: number;
}

export type DropTargetType = 'tab' | 'group' | 'window' | 'ungrouped-area';

export interface DropTarget {
  type: DropTargetType;
  id: number;
  windowId: number;
  index?: number;
}

interface DragContextValue {
  dragItem: DragItem | null;
  dropTarget: DropTarget | null;
  isDragging: boolean;
  startDrag: (item: DragItem) => void;
  setDropTarget: (target: DropTarget | null) => void;
  endDrag: () => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: ReactNode }) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTargetState] = useState<DropTarget | null>(null);

  const startDrag = useCallback((item: DragItem) => {
    setDragItem(item);
  }, []);

  const setDropTarget = useCallback((target: DropTarget | null) => {
    setDropTargetState(target);
  }, []);

  const endDrag = useCallback(() => {
    setDragItem(null);
    setDropTargetState(null);
  }, []);

  return (
    <DragContext.Provider
      value={{
        dragItem,
        dropTarget,
        isDragging: dragItem !== null,
        startDrag,
        setDropTarget,
        endDrag,
      }}
    >
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
}

