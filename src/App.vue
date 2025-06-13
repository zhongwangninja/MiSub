<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from '@/lib/components/Dashboard.vue'; // 确认是 @/components/...
import Login from '@/lib/components/Login.vue'; // 确认是 @/components/...

const sessionState = ref('loading');
const initialData = ref(null);

const checkSession = async () => {
    // ...
};

const handleLoginSuccess = () => {
    window.location.reload();
};

onMounted(checkSession);
</script>

<template>
  <div v-if="sessionState === 'loading'">...</div>
  <Dashboard v-else-if="sessionState === 'loggedIn'" :data="initialData" />
  <Login v-else @success="handleLoginSuccess" />
</template>