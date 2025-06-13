<script setup>
import { ref, onMounted, computed } from 'vue'; // 1. 导入 computed
import clsx from 'clsx';
import { useToast } from '../lib/stores.js';

const props = defineProps({
  config: Object
});

const { showToast } = useToast();

const tabs = [
	{ id: 'sub', query: '', title: '通用' },
	{ id: 'b64', query: 'base64', title: 'Base64' },
	{ id: 'clash', query: 'clash', title: 'Clash' },
	{ id: 'sb', query: 'singbox', title: 'Sing-Box' },
	{ id: 'surge', query: 'surge', title: 'Surge' }
];

const activeTab = ref('sub');

// 2. 将 baseUrl 改为计算属性
const baseUrl = computed(() => {
    if (props.config && props.config.mytoken && typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}/sub?token=${props.config.mytoken}`;
    }
    return '';
});

const copyToClipboard = (text) => {
    if (!text) {
        showToast('链接为空，无法复制', 'error');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板！');
    }).catch(err => {
        showToast('复制失败: ' + err, 'error');
    });
};
</script>

<template>
    <div class="bg-white/60 dark:bg-gray-900/50 rounded-xl shadow-sm ring-1 ring-inset ring-gray-900/5 dark:ring-white/10 p-5 sticky top-24">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">订阅链接</h2>
    
    <div class="border-b border-gray-200 dark:border-white/10">
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="clsx(
                    'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id 
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                )"
            >
                {{ tab.title }}
            </button>
        </nav>
    </div>

    <div class="mt-4 min-h-[68px]">
        <div v-if="baseUrl">
            <div v-for="tab in tabs" :key="tab.id">
                <div v-if="activeTab === tab.id">
                    <div class="relative">
                        <input
                            type="text"
                            readonly
                            :value="`${baseUrl}${tab.query ? `&target=${tab.query}` : ''}`"
                            class="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md px-3 py-2 pr-10 focus:outline-none font-mono"
                        />
                        <button 
                            @click="copyToClipboard(`${baseUrl}${tab.query ? `&target=${tab.query}` : ''}`)"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                            title="复制链接"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-center text-xs text-gray-400 pt-4">
            Token 未配置, 无法生成链接
        </div>
    </div>
  </div>
</template>