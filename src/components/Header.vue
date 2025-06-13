<script setup>
import ThemeToggle from './ThemeToggle.vue';
import { showSettingsModal } from '../lib/stores.js';

const logout = async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.reload();
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border-b border-gray-200 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 text-indigo-500" ...></svg>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">MISUB</h1>
        </div>
        <div class="flex items-center gap-2">
          <button @click="showSettingsModal = true" title="设置" class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" ...></svg>
          </button>
          <ThemeToggle />
          <button @click="logout" class="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">登出</button>
        </div>
      </div>
    </div>
  </header>
</template>