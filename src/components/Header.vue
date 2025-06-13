<script setup>
import ThemeToggle from './ThemeToggle.vue';
</script>

<template>
  <header class="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border-b border-gray-200 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm-1.5 6.136a.75.75 0 0 1 1.06 0l1.591 1.591a.75.75 0 0 1-1.06 1.06l-1.591-1.591a.75.75 0 0 1 0-1.06Z" /></svg>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">MISUB</h1>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button @click="() => window.location.href = '/api/logout'" class="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">登出</button>
        </div>
      </div>
    </div>
  </header>
</template>