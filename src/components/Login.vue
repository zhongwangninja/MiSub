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
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md mx-auto bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10 shadow-2xl rounded-2xl p-8 text-center">
        <div class="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 ring-4 ring-white dark:ring-indigo-500/30">
            <svg class="h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm-1.5 6.136a.75.75 0 0 1 1.06 0l1.591 1.591a.75.75 0 0 1-1.06 1.06l-1.591-1.591a.75.75 0 0 1 0-1.06Z" />
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">MISUB</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 mb-6 text-sm">请输入管理员密码以继续</p>
        
        <div v-if="error" class="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 text-sm rounded-lg p-3 mb-6" role="alert">
            {{error}}
        </div>

        <form @submit.prevent="handleSubmit" class="text-left">
            <div>
                <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">密码</label>
                <div class="relative">
                    <input 
                        v-model="password"
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        class="w-full bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" 
                        placeholder="请输入密码"
                    >
                    <svg class="h-5 w-5 text-gray-400 dark:text-gray-500 absolute top-1/2 left-3 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
            </div>
            <div class="mt-6">
                <button 
                    type="submit" 
                    :disabled="isLoading"
                    class="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-indigo-800 disabled:cursor-not-allowed"
                >
                    {{ isLoading ? '授权中...' : '授权访问' }}
                </button>
            </div>
        </form>
    </div>
  </div>
</template>