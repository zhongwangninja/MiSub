<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';
import Header from './components/Header.vue';
import DashboardSkeleton from './components/DashboardSkeleton.vue'; // 1. 导入骨架屏
import { fetchInitialData } from './lib/api.js';
import { useTheme } from './lib/stores.js';

const { initTheme } = useTheme(); // 2. 获取初始化函数

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
  initTheme(); // 3. 在应用挂载时，立即初始化主题
  checkSession();
});
</script>

<template>
  <Header />
  <main class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <div v-if="sessionState === 'loading'">
      <DashboardSkeleton /> </div>
    <Dashboard v-else-if="sessionState === 'loggedIn' && initialData" :data="initialData" />
    <Login v-else @success="handleLoginSuccess" />
  </main>
</template>