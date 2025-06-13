import { reactive, readonly, ref } from 'vue';

// --- Theme Store ---
const themeState = reactive({
  current: 'dark',
});

const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    themeState.current = newTheme;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
};

const initTheme = () => {
    if (typeof window === 'undefined') return;
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;
    themeState.current = initialTheme;
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
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


// --- Settings Modal Store ---
// 添加这部分缺失的代码
export const showSettingsModal = ref(false);