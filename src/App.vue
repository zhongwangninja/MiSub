<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';
import Header from './components/Header.vue';
import DashboardSkeleton from './components/DashboardSkeleton.vue';
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
  <Header />

  <main>
    <div v-if="sessionState === 'loading'" class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardSkeleton />
    </div>
    <Dashboard v-else-if="sessionState === 'loggedIn' && initialData" :data="initialData" />
    <Login v-else @success="handleLoginSuccess" />
  </main>
</template>