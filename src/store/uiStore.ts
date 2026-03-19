import { create } from 'zustand';

interface UiState {
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;
    closeSidebars: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    isLeftSidebarOpen: false,
    isRightSidebarOpen: false,

    toggleLeftSidebar: () => set((state) => ({
        isLeftSidebarOpen: !state.isLeftSidebarOpen,
        isRightSidebarOpen: false
    })),

    toggleRightSidebar: () => set((state) => ({
        isRightSidebarOpen: !state.isRightSidebarOpen,
        isLeftSidebarOpen: false
    })),

    closeSidebars: () => set({
        isLeftSidebarOpen: false,
        isRightSidebarOpen: false
    }),
}));