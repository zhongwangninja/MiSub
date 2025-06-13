<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';
import { fetchInitialData } from './lib/api.js';
import { useTheme } from './lib/stores.js';

const { initTheme } = useTheme();

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

const handleLoginSuccess = () => {
  window.location.reload();
};

onMounted(() => {
  initTheme();
  checkSession();
});
</script>

<template>
  <div v-if="sessionState === 'loading'" class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <p>正在加载...</p>
  </div>
  <Dashboard v-else-if="sessionState === 'loggedIn' && initialData" :data="initialData" />
  <Login v-else @success="handleLoginSuccess" />
</template>