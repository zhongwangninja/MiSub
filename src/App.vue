<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from './lib/stores.js';
import { fetchInitialData, login as apiLogin } from './lib/api.js';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';
import Header from './components/Header.vue';
import Toast from './components/Toast.vue';
import { useToast } from './lib/stores.js';

const { initTheme, theme } = useTheme();
const { toast: toastState } = useToast();

const sessionState = ref('loading');
const initialData = ref(null);

const checkSession = async () => {
  try {
    const data = await fetchInitialData();
    if (data) {
      initialData.value = data;
      sessionState.value = 'loggedIn';
    } else {
      sessionState.value = 'loggedOut';
    }
  } catch (error) {
    console.error("Session check failed:", error);
    sessionState.value = 'loggedOut';
  }
};

const login = async (password) => {
  try {
    const response = await apiLogin(password);
    if (response.ok) {
      handleLoginSuccess();
    } else {
      const errData = await response.json();
      throw new Error(errData.error || '登录失败');
    }
  } catch(e) {
    throw e;
  }
};

const handleLoginSuccess = () => {
  sessionState.value = 'loading';
  checkSession();
};

const handleLogout = async () => {
  await fetch('/api/logout');
  sessionState.value = 'loggedOut';
  initialData.value = null;
};

onMounted(() => {
  initTheme();
  checkSession();
});
</script>

<template>
  <div 
    :class="theme" 
    class="min-h-screen flex flex-col text-gray-800 dark:text-gray-200 transition-colors duration-300 bg-gray-100 dark:bg-gray-950"
  >
    <Header :is-logged-in="sessionState === 'loggedIn'" @logout="handleLogout" />

    <main 
      class="flex-grow overflow-y-auto"
      :class="{ 'flex items-center justify-center': sessionState !== 'loggedIn' }"
    >
      <div v-if="sessionState === 'loading'" class="text-center">
        <p class="text-gray-500">正在加载...</p>
      </div>
      <Dashboard v-else-if="sessionState === 'loggedIn' && initialData" :data="initialData" />
      
      <div v-else class="w-full flex justify-center p-4 -mt-20">
        <Login :login="login" />
      </div>
    </main>
    
    <Toast :show="toastState.id" :message="toastState.message" :type="toastState.type" />
  </div>
</template>

<style>
:root.dark {
  color-scheme: dark;
}
:root.light {
  color-scheme: light;
}
</style>