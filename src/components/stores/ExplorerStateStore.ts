// explorer-store.ts
import {signal} from "@preact/signals";

export interface ExplorerState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    folders: Record<string, boolean>;
    toggleFolder: (path: string) => void;
    initializeFolders: (paths: string[]) => void;
}

// localStorage keys
const STORAGE_KEY = "explorer_store";
const SIDEBAR_KEY = "isSidebarOpen";
const FOLDERS_KEY = "folders";

// Helper functions for localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY}:${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const saveToStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(value));
};

// Create the store
const createExplorerStore = (): ExplorerState => {
    // Load initial state from localStorage
    const isSidebarOpen = signal(loadFromStorage(SIDEBAR_KEY, true));
    const folders = signal<Record<string, boolean>>(loadFromStorage(FOLDERS_KEY, {}));

    // Save to localStorage whenever these signals change
    isSidebarOpen.subscribe(value => {
        saveToStorage(SIDEBAR_KEY, value);
    });

    folders.subscribe(value => {
        saveToStorage(FOLDERS_KEY, value);
    });

    // Actions
    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value;
    };

    const toggleFolder = (path: string) => {
        folders.value = {
            ...folders.value,
            [path]: !folders.value[path]
        };
    };

    const initializeFolders = (paths: string[]) => {
        // Only initialize folders that aren't already in the store
        const currentFolders = {...folders.value};
        paths.forEach(path => {
            if (!(path in currentFolders)) {
                currentFolders[path] = false;
            }
        });
        folders.value = currentFolders;
    };

    return {
        get isSidebarOpen() {
            return isSidebarOpen.value;
        },
        toggleSidebar,
        get folders() {
            return folders.value;
        },
        toggleFolder,
        initializeFolders
    };
};

// Export a singleton instance
export const explorerStore = createExplorerStore();
