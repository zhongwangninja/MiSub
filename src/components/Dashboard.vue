<script setup>
import { ref, computed, onMounted } from 'vue';
import { saveMisubs } from '../lib/api.js';
import { extractNodeName } from '../lib/utils.js';
import { useToast } from '../lib/stores.js';
import { showSettingsModal } from '../lib/stores.js';

import Header from './Header.vue';
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
const isLoading = ref(true);

onMounted(() => {
  if (props.data) {
    misubs.value = props.data.misubs?.map(s => ({ ...s, id: crypto.randomUUID(), nodeCount: 0 })) || [];
    config.value = props.data.config || {};
  }
  isLoading.value = false;
});


const subsDirty = ref(false);
const showDeleteAllModal = ref(false);
const showBulkImportModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 9;

// --- 【关键修改】为保存按钮增加更丰富的状态 ---
const saveState = ref('idle'); // 'idle', 'saving', 'success'

const totalPages = computed(() => Math.ceil(misubs.value.length / itemsPerPage));
const paginatedMisubs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return misubs.value.slice(start, end);
});

const handleDelete = (id) => {
  misubs.value = misubs.value.filter((s) => s.id !== id);
  subsDirty.value = true;
  saveState.value = 'idle'; // 如果在成功状态下又做了修改，按钮应恢复
};

const handleAdd = () => {
  misubs.value.unshift({ id: crypto.randomUUID(), name: '', url: '', enabled: true, isNew: true, nodeCount: 0 });
  currentPage.value = 1;
  subsDirty.value = true;
  saveState.value = 'idle';
};

const handleSave = async () => {
  saveState.value = 'saving';
  const payload = misubs.value.map(({ id, nodeCount, isNew, ...rest }) => rest);
  const result = await saveMisubs(payload);
  
  if (result.success) {
    saveState.value = 'success'; // 切换到成功状态
    misubs.value.forEach(sub => {
      if (sub.isNew) sub.isNew = false;
    });
    // 1.5秒后，隐藏按钮
    setTimeout(() => {
        subsDirty.value = false;
        saveState.value = 'idle'; // 重置状态
    }, 1500);
  } else {
    showToast(result.message || '保存失败', 'error');
    saveState.value = 'idle'; // 保存失败，恢复按钮
  }
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
  saveState.value = 'idle';
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <Header @open-settings="showSettingsModal = true" />
  <main class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    </main>
  
  <Transition name="fab">
    <div v-if="subsDirty" class="fixed bottom-8 right-8 z-50">
        <button 
            @click="handleSave" 
            :disabled="saveState === 'saving' || saveState === 'success'"
            class="px-5 py-3 text-white font-semibold rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
            :class="{
                'bg-green-600 hover:bg-green-700': saveState === 'idle',
                'bg-gray-500 cursor-not-allowed': saveState === 'saving',
                'bg-teal-500': saveState === 'success',
            }"
        >
            <div v-if="saveState === 'saving'" class="flex items-center">
                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>保存中...</span>
            </div>
            <div v-else-if="saveState === 'success'" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span>已保存</span>
            </div>
            <span v-else>保存更改</span>
        </button>
    </div>
  </Transition>

  <BulkImportModal v-model:show="showBulkImportModal" @import="handleBulkImport" />
  <Modal v-model:show="showDeleteAllModal" @confirm="handleDeleteAll">
    </Modal>
  <SettingsModal v-model:show="showSettingsModal" />
</template>