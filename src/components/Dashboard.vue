<script setup>
import { ref, computed, onMounted } from 'vue';
import { saveMisubs } from '../lib/api.js';
import { extractNodeName } from '../lib/utils.js';
import { useToast } from '../lib/stores.js';
import { showSettingsModal } from '../lib/stores.js';

import SettingsModal from './SettingsModal.vue';
import Overview from './Overview.vue';
import Card from './Card.vue';
import Modal from './Modal.vue';
import BulkImportModal from './BulkImportModal.vue';
import RightPanel from './RightPanel.vue';

const props = defineProps({
  data: Object,
});

const { showToast } = useToast();

const misubs = ref([]);
const config = ref({});

onMounted(() => {
  if (props.data) {
    misubs.value = props.data.misubs?.map(s => ({ ...s, id: crypto.randomUUID(), nodeCount: 0, enabled: s.enabled ?? true })) || [];
    config.value = props.data.config || {};
  }
});

const subsDirty = ref(false);
const saveState = ref('idle'); // idle, saving, success
const showDeleteAllModal = ref(false);
const showBulkImportModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 9;

const totalPages = computed(() => Math.ceil(misubs.value.length / itemsPerPage));
const paginatedMisubs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return misubs.value.slice(start, end);
});

const markDirty = () => {
    subsDirty.value = true;
    saveState.value = 'idle';
}

const handleDelete = (id) => {
  misubs.value = misubs.value.filter((s) => s.id !== id);
  markDirty();
  showToast('已从列表移除，请点击保存');
};

const handleAdd = () => {
  misubs.value.unshift({ id: crypto.randomUUID(), name: '', url: '', enabled: true, isNew: true, nodeCount: 0 });
  currentPage.value = 1;
  markDirty();
  showToast('已添加新卡片，请填写并保存');
};

const handleSave = async () => {
  saveState.value = 'saving';
  const payload = misubs.value.map(({ id, nodeCount, isNew, ...rest }) => rest);
  const result = await saveMisubs(payload);
  
  if (result.success) {
    saveState.value = 'success';
    misubs.value.forEach(sub => {
      if (sub.isNew) sub.isNew = false;
    });
    setTimeout(() => {
        subsDirty.value = false;
        saveState.value = 'idle';
    }, 1500);
  } else {
    showToast(result.message || '保存失败', 'error');
    saveState.value = 'idle';
  }
};

const handleDeleteAll = async () => {
  misubs.value = [];
  await handleSave();
  showDeleteAllModal.value = false;
};

const handleBulkImport = (importText) => {
  if (!importText) return;
  const lines = importText.split('\n').map(line => line.trim()).filter(Boolean);
  const newSubs = lines.map(line => ({
    id: crypto.randomUUID(),
    name: extractNodeName(line) || '未命名节点',
    url: line,
    enabled: true,
    nodeCount: 0,
  }));
  misubs.value = [...newSubs, ...misubs.value];
  currentPage.value = 1;
  markDirty();
  showToast(`成功导入 ${lines.length} 条数据，请点击保存`);
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-8">
            <Overview :misubs="misubs" />
            <div>
                <div class="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-white/10 pb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">我的订阅</h2>
                    <div class="flex items-center gap-2">
                        <button @click="showDeleteAllModal = true" class="text-sm px-3 py-1.5 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors">清空所有</button>
                        <button @click="showBulkImportModal = true" class="text-sm px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">批量导入</button>
                        <button @click="handleAdd" class="text-sm font-semibold px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">新增订阅</button>
                    </div>
                </div>

                <div v-if="misubs.length > 0">
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      <Card
                        v-for="misub in paginatedMisubs"
                        :key="misub.id"
                        :misub="misub"
                        @delete="handleDelete(misub.id)"
                        @change="markDirty"
                      />
                  </div>
                  
                  <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-8 text-sm font-medium">
                      <button 
                          @click="changePage(currentPage - 1)" 
                          :disabled="currentPage === 1" 
                          class="px-3 py-1 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >&laquo; 上一页</button>

                      <span class="text-gray-500 dark:text-gray-400">第 {{ currentPage }} / {{ totalPages }} 页</span>

                      <button 
                          @click="changePage(currentPage + 1)" 
                          :disabled="currentPage === totalPages"
                          class="px-3 py-1 rounded-md disabled:opacity-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >下一页 &raquo;</button>
                  </div>
                </div>
                <div v-else class="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <div class="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 11h10" />
                      </svg>
                  </div>
                  <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">你的订阅列表是空的</h3>
                  <p class="mt-1 text-sm text-gray-500">开始添加你的第一个订阅链接吧！</p>
                 <div class="mt-6">
                      <button @click="handleAdd" class="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
                          新增订阅
                      </button>
                  </div>
              </div>
            </div>
        </div>
        <div class="lg:col-span-1">
            <RightPanel :config="config" />
        </div>
    </div>
  </div>
  
  <Transition name="fab">
    <div v-if="subsDirty" class="fixed bottom-8 right-8 z-50">
        <button 
            @click="handleSave" 
            :disabled="saveState !== 'idle'"
            class="px-5 py-3 text-white font-semibold rounded-full shadow-lg flex items-center justify-center transition-all duration-300 w-32"
            :class="{
                'bg-green-600 hover:bg-green-700': saveState === 'idle',
                'bg-gray-500 cursor-not-allowed': saveState === 'saving',
                'bg-teal-500 cursor-not-allowed': saveState === 'success',
            }"
        >
            <div v-if="saveState === 'saving'" class="flex items-center">
                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>保存中</span>
            </div>
            <div v-else-if="saveState === 'success'" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span>已保存</span>
            </div>
            <span v-else>保存更改</span>
        </button>
    </div>
  </Transition>

  <BulkImportModal v-model:show="showBulkImportModal" @import="handleBulkImport" />
  <Modal v-model:show="showDeleteAllModal" @confirm="handleDeleteAll">
    <template #title><h3 class="text-lg font-bold text-red-500">确认清空</h3></template>
    <template #body><p class="text-sm text-gray-400">您确定要删除所有订阅源吗？此操作将立即保存且无法恢复。</p></template>
  </Modal>
  <SettingsModal v-model:show="showSettingsModal" />
</template>

<style scoped>
.fab-enter-active, .fab-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fab-enter-from, .fab-leave-to { opacity: 0; transform: scale(0.9) translateY(10px); }
</style>