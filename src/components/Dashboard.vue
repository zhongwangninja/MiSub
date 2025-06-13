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
                </div>
        </div>
        <div class="lg:col-span-1">
            <RightPanel :config="config" />
        </div>
    </div>
  </div>
  
  <Transition name="fab">
    </Transition>
  <BulkImportModal v-model:show="showBulkImportModal" @import="handleBulkImport" />
  <Modal v-model:show="showDeleteAllModal" @confirm="handleDeleteAll">
    </Modal>
  <SettingsModal v-model:show="showSettingsModal" />
</template>