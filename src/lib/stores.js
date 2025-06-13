//
// src/lib/stores.js
//
import { reactive, readonly } from 'vue';

// --- Theme Store ---
const themeState = reactive({
  current: 'dark',
});

const toggleTheme = () => {
    themeState.current = themeState.current === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', themeState.current === 'dark');
    localStorage.setItem('theme', themeState.current);
};

const initTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    themeState.current = storedTheme || systemTheme;
    document.documentElement.classList.toggle('dark', themeState.current === 'dark');
};

export const useTheme = () => {
  return {
    theme: readonly(themeState),
    toggleTheme,
    initTheme
  };
};


// --- Toast Store ---
const toastState = reactive({
    message: '',
    type: 'success',
    id: 0,
});

let toastTimeout;

const showToast = (message, type = 'success', duration = 3000) => {
    toastState.message = message;
    toastState.type = type;
    toastState.id = Date.now();

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastState.message = '';
    }, duration);
};

export const useToast = () => {
    return {
        toast: readonly(toastState),
        showToast
    };
};

export const showSettingsModal = ref(false);