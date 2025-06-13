<script setup>
import { ref, computed, onMounted } from 'vue';
import { saveMisubs } from '$api';
import { extractNodeName } from '$utils';
import { useToast } from '$stores';

import Header from './Header.vue';
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
const isLoading = ref(true);

onMounted(() => {
  if (props.data) {
    misubs.value = props.data.misubs.map(s => ({ ...s, id: crypto.randomUUID(), nodeCount: 0 })) || [];
    config.value = props.data.config || {};
  }
  isLoading.value = false;
});


const isSaving = ref(false);
const subsDirty = ref(false);
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

const handleDelete = (id) => {
  misubs.value = misubs.value.filter((s) => s.id !== id);
  subsDirty.value = true;
  showToast('已从列表移除，请点击保存');
};

const handleAdd = () => {
  misubs.value.unshift({
    id: crypto.randomUUID(),
    name: '',
    url: '',
    enabled: true,
    isNew: true,
    nodeCount: 0
  });
  currentPage.value = 1;
  showToast('已添加新卡片，请填写并保存');
};

const handleSave = async () => {
  isSaving.value = true;
  const payload = misubs.value.map(({ id, nodeCount, isNew, ...rest }) => rest);
  const result = await saveMisubs(payload);
  if (result.success) {
    showToast('保存成功！', 'success');
    subsDirty.value = false;
  } else {
    showToast(result.message || '保存失败', 'error');
  }
  isSaving.value = false;
};

const handleDeleteAll = async () => {
  misubs.value = [];
  subsDirty.value = true;
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
  subsDirty.value = true;
  currentPage.value = 1;
  showToast(`成功导入 ${lines.length} 条数据，请点击保存`);
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <Header />

  <main class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-8">
            <Overview :misubs="misubs" />
            <div>
                <div class="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-white/10 pb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">我的订阅</h2>
                    <div class="flex items-center gap-2">
                        <button @click="showDeleteAllModal = true" class="text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">清空所有</button>
                        <button @click="showBulkImportModal = true" class="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-500/10 dark:hover:bg-white/10 transition-colors">批量导入</button>
                        <button @click="handleAdd" class="text-sm font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">新增订阅</button>
                    </div>
                </div>

                <div v-if="misubs.length > 0">
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      <Card
                        v-for="misub in paginatedMisubs"
                        :key="misub.id"
                        :misub="misub"
                        @delete="handleDelete(misub.id)"
                        @change="subsDirty = true"
                      />
                  </div>
                  
                  <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-8 text-sm font-medium">
                      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">&laquo; 上一页</button>
                      <span class="text-gray-500 dark:text-gray-400">第 {{ currentPage }} / {{ totalPages }} 页</span>
                      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">下一页 &raquo;</button>
                  </div>
                </div>
                <div v-else class="text-center py-16 text-gray-500">
                    <p>暂无订阅，请点击右上角 "新增订阅" 添加一个。</p>
                </div>
            </div>
        </div>
        <div class="lg:col-span-1">
            <RightPanel :config="config" />
        </div>
    </div>
  </main>
  
  <Transition name="fab">
    <div v-if="subsDirty" class="fixed bottom-8 right-8 z-50">
        <button @click="handleSave" :disabled="isSaving" class="px-5 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-all disabled:bg-green-800 disabled:cursor-not-allowed">
            <span v-if="isSaving">...</span>
            <span v-else>保存更改</span>
        </button>
    </div>
  </Transition>

  <BulkImportModal v-model:show="showBulkImportModal" @import="handleBulkImport" />
  <Modal v-model:show="showDeleteAllModal" @confirm="handleDeleteAll">
    <template #title><h3 class="text-lg font-bold text-red-500">确认清空</h3></template>
    <template #body><p class="text-sm text-gray-400">您确定要删除所有订阅源吗？此操作将立即保存且无法恢复。</p></template>
  </Modal>
</template>

<style scoped>
.fab-enter-active,
.fab-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>