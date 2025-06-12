import { writable } from 'svelte/store';

// Theme Store
const createThemeStore = () => {
    const isBrowser = typeof window !== 'undefined';
    const initialValue = isBrowser ? localStorage.getItem('theme') || 'dark' : 'dark';
    const { subscribe, set } = writable(initialValue);
    return {
        subscribe,
        toggle: () => {
            if (!isBrowser) return;
            const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            localStorage.setItem('theme', newTheme);
            set(newTheme);
        },
        init: () => {
            if (!isBrowser) return;
            const storedTheme = localStorage.getItem('theme');
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const initialTheme = storedTheme || systemTheme;
            document.documentElement.classList.toggle('dark', initialTheme === 'dark');
            set(initialTheme);
        }
    };
};
export const theme = createThemeStore();

// Toast Store
const createToastStore = () => {
    const { subscribe, set } = writable({ message: '', type: 'success' });
    return {
        subscribe,
        show: (message, type = 'success') => set({ message, type, id: Date.now() }),
    };
};
export const toastStore = createToastStore();