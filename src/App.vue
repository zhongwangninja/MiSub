<script setup>
import { ref, onMounted } from 'vue';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';

// 定义三种状态: loading, loggedIn, loggedOut
const sessionState = ref('loading');
const initialData = ref(null);

// 检查会话状态
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

// 登录成功后的处理函数
const handleLoginSuccess = () => {
  // 采用最稳健的页面重载方式
  window.location.reload();
};

// 组件挂载后检查会话
onMounted(checkSession);
</script>

<template>
  <div v-if="sessionState === 'loading'" class="flex items-center justify-center min-h-screen">
    <p>正在加载...</p>
  </div>
  <Dashboard v-else-if="sessionState === 'loggedIn'" :data="initialData" />
  <Login v-else @success="handleLoginSuccess" />
</template>