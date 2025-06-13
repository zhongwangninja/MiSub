<script setup>
import { ref } from 'vue';
import { login } from '../lib/api.js';

const emit = defineEmits(['success']);

const password = ref('');
const isLoading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  if (!password.value) {
    error.value = '请输入密码';
    return;
  }
  isLoading.value = true;
  error.value = '';

  const response = await login(password.value);
  
  if (response.ok) {
    emit('success');
  } else {
    try {
      const result = await response.json();
      error.value = result.error || '登录失败，请重试';
    } catch {
      error.value = '登录请求失败';
    }
  }
  isLoading.value = false;
};
</script>

<template>
  <div class="flex items-center justify-center h-full p-4">
    <div class="w-full max-w-md mx-auto bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10 shadow-2xl rounded-2xl p-8 text-center">
        </div>
  </div>
</template>