<script setup>
import { computed } from 'vue';
import { useAnimatedCounter } from '../lib/useAnimatedCounter.js';

const props = defineProps({
  misubs: Array
});

// 1. 创建基于 props 的计算属性
const totalMisubs = computed(() => props.misubs?.length || 0);
const enabledMisubs = computed(() => props.misubs?.filter(s => s.enabled).length || 0);
const totalNodes = computed(() => props.misubs?.reduce((acc, sub) => acc + (sub.nodeCount || 0), 0) || 0);

// 2. 将计算属性传入动画计数器，得到用于显示的新变量
const displayTotal = useAnimatedCounter(totalMisubs);
const displayEnabled = useAnimatedCounter(enabledMisubs);
const displayNodes = useAnimatedCounter(totalNodes);

// 3. 让 stats 数组使用这些新的显示变量
const stats = computed(() => [
  { name: '总订阅数', value: displayTotal.value },
  { name: '已启用', value: displayEnabled.value },
  { name: '总节点数', value: displayNodes.value }
]);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div v-for="stat in stats" :key="stat.name" class="bg-white/60 dark:bg-gray-900/50 p-5 rounded-xl shadow-sm ring-1 ring-inset ring-gray-900/5 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-indigo-500/30">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.name }}</p>
      <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ stat.value }}</p>
    </div>
  </div>
</template>