<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  config: Object
});

const formats = ['通用', 'Base64', 'Clash', 'Sing-Box', 'Surge', 'Loon', 'QuanX'];
const selectedFormat = ref('通用');

const subLink = computed(() => {
  const token = props.config?.mytoken === 'auto' ? 'auto' : props.config?.mytoken;
  if (!token) return '';
  
  const baseUrl = `http://${window.location.host}/sub?token=${token}`;
  let result = baseUrl;

  switch(selectedFormat.value) {
    case 'Base64':
      result = btoa(baseUrl);
      break;
    case 'Clash':
    case 'Sing-Box':
    case 'Surge':
    case 'Loon':
    case 'QuanX':
      // 这里可以根据需要，未来对接 sub-converter
      result += `&target=${selectedFormat.value.toLowerCase()}`;
      break;
  }
  return result;
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(subLink.value);
  // 这里可以集成你的 Toast 提示
  // showToast('已复制到剪贴板');
};
</script>

<template>
  <div class="sticky top-24">
    <div class="bg-white/50 dark:bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg dark:shadow-2xl ring-1 ring-black/5">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">订阅链接</h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="format in formats"
          :key="format"
          @click="selectedFormat = format"
          class="px-3 py-1 text-xs font-medium rounded-full transition-colors"
          :class="[
            selectedFormat === format
              ? 'bg-indigo-600 text-white'
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
        <button @click="copyToClipboard" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>