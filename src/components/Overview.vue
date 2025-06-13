<script setup>
import { computed } from 'vue';

const props = defineProps({
  misubs: Array
});

const totalMisubs = computed(() => props.misubs?.length || 0);
const enabledMisubs = computed(() => props.misubs?.filter(s => s.enabled).length || 0);
const totalNodes = computed(() => props.misubs?.reduce((acc, sub) => acc + (sub.nodeCount || 0), 0) || 0);

const stats = computed(() => [
  { name: '总订阅数', value: totalMisubs.value },
  { name: '已启用', value: enabledMisubs.value },
  { name: '总节点数', value: totalNodes.value }
]);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div v-for="stat in stats" :key="stat.name" class="bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-sm border border-transparent dark:border-white/10">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.name }}</p>
      <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{{ stat.value }}</p>
    </div>
  </div>
</template>