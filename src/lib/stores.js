import { reactive, readonly, ref } from 'vue';

// --- Theme Store ---
const themeState = reactive({ current: 'dark' });
export const useTheme = () => {
  const toggleTheme = () => {
      const newTheme = themeState.current === 'dark' ? 'light' : 'dark';
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
  return { theme: readonly(themeState), toggleTheme, initTheme };
};

// --- Toast Store ---
const toastState = reactive({ message: '', type: 'success', id: 0 });
let toastTimeout;
export const useToast = () => {
  const showToast = (message, type = 'success', duration = 3000) => {
      toastState.message = message;
      toastState.type = type;
      toastState.id = Date.now();
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => { toastState.message = ''; }, duration);
  };
  return { toast: readonly(toastState), showToast };
};

// --- Settings Modal Store ---
export const showSettingsModal = ref(false);