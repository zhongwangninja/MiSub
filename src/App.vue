<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from '@/components/Dashboard.vue';
import Login from '@/components/Login.vue';

const sessionState = ref('loading');
const initialData = ref(null);

const checkSession = async () => {
  try {
    const response = await fetch('/api/data');
    if (response.ok) {
      initialData.value = await response.json();
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

onMounted(checkSession);
</script>

<template>
  <div v-if="sessionState === 'loading'" class="flex items-center justify-center min-h-screen">
    <p>正在加载...</p>
  </div>
  <Dashboard v-else-if="sessionState === 'loggedIn'" :data="initialData" />
  <Login v-else @success="handleLoginSuccess" />
</template>