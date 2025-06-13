<script setup>
import ThemeToggle from './ThemeToggle.vue';
const emit = defineEmits(['open-settings']);

const logout = async () => {
    // 向后端发送登出请求
    await fetch('/api/logout', { method: 'POST' });
    // 成功后刷新页面，回到登录页
    window.location.reload();
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border-b border-gray-200 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-2">
          <button @click="emit('open-settings')" title="设置" class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <ThemeToggle />
          <button @click="() => window.location.href = '/api/logout'" class="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">登出</button>
        </div>
      </div>
    </div>
  </header>
</template>