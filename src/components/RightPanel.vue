<script setup>
import { ref, computed } from 'vue';
import { useToast } from '../lib/stores.js';

const props = defineProps({
  config: Object
});

const { showToast } = useToast();

// 【核心修正】将 Shadowrocket 替换为 Snell
const formats = ['自适应', 'Base64', 'Clash', 'Sing-Box', 'Surge', 'Loon', 'QuanX', 'Snell'];
const selectedFormat = ref('自适应');

const subLink = computed(() => {
  const token = props.config?.mytoken === 'auto' ? 'auto' : props.config?.mytoken;
  if (!token) return '请先在设置中配置 Token';
  
  const baseUrl = `${window.location.protocol}//${window.location.host}/sub?token=${token}`;
  
  const format = selectedFormat.value;

  if (format === '自适应') {
    return baseUrl;
  }

  const target = format.toLowerCase();
  return `${baseUrl}&target=${target}`;
});

const copyToClipboard = () => {
  if (!subLink.value || subLink.value.startsWith('请先')) {
    showToast('链接无效，无法复制', 'error');
    return;
  }
  navigator.clipboard.writeText(subLink.value);
  showToast('已复制到剪贴板', 'success');
};
</script>

<template>
  <div class="sticky top-24">
    <div class="bg-white/50 dark:bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg dark:shadow-2xl ring-1 ring-black/5">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">订阅链接</h3>
      <div class="grid grid-cols-4 gap-2 mb-4">
        <button
          v-for="format in formats"
          :key="format"
          @click="selectedFormat = format"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex justify-center"
          :class="[
            selectedFormat === format
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-600/50'
          ]"
        >
          {{ format }}
        </button>
      </div>
      <div class="relative">
        <input
          type="text"
          :value="subLink"
          readonly
          class="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
        />
        <button @click="copyToClipboard" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500" title="复制">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>