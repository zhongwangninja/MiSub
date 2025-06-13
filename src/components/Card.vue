<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { fetchNodeCount } from '../lib/api.js';
import { extractNodeName } from '../lib/utils.js';

import Vmess from '../icons/Vmess.vue';
import Trojan from '../icons/Trojan.vue';
import Ss from '../icons/Ss.vue';
import Http from '../icons/Http.vue';
import Clash from '../icons/Clash.vue';
import Hysteria2 from '../icons/Hysteria2.vue';
import Vless from '../icons/Vless.vue';

const props = defineProps({
  misub: Object
});

const emit = defineEmits(['delete', 'change']);

const nodeCount = ref('...');
const isEditing = ref(props.misub.isNew || false);
const nameInput = ref(null);
const misubRef = ref(props.misub);

let debounceTimer;

const updateNodeCount = async () => {
  if (misubRef.value.url && misubRef.value.url.startsWith('http')) {
    const data = await fetchNodeCount(misubRef.value.url);
    nodeCount.value = data.count;
    misubRef.value.nodeCount = typeof data.count === 'number' ? data.count : 0;
  } else if (misubRef.value.url) {
    nodeCount.value = 1;
    misubRef.value.nodeCount = 1;
  } else {
    nodeCount.value = 0;
    misubRef.value.nodeCount = 0;
  }
  emit('change');
};

const getProtocol = (url) => {
  try {
    if (!url) return 'unknown';
    // 2. 增加对 hysteria2 的识别
    if (url.toLowerCase().startsWith('hy2://') || url.toLowerCase().startsWith('hysteria2://')) {
        return 'hysteria2';
    }
    const u = new URL(url);
    if (u.protocol.startsWith('http')) return 'http';
    return u.protocol.replace(':', '');
  } catch {
    return 'unknown';
  }
};

const protocol = computed(() => getProtocol(misubRef.value.url));

const handleUrlChange = () => {
  if (!misubRef.value.name || misubRef.value.isNew) {
    const extracted = extractNodeName(misubRef.value.url);
    if (extracted) {
      misubRef.value.name = extracted;
    }
  }
  if (misubRef.value.isNew) {
    misubRef.value.isNew = false;
  }
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateNodeCount();
  }, 500);

  emit('change');
};

onMounted(() => {
  if (isEditing.value) {
    nameInput.value?.focus();
  }
  updateNodeCount();
});
</script>

<template>
  <div class="group bg-white/60 dark:bg-gray-900/50 rounded-xl shadow-sm ring-1 ring-inset ring-gray-900/5 dark:ring-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-indigo-500/30 relative">
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-3 overflow-hidden flex-1">
        <div class="flex-shrink-0 w-6 h-6 text-indigo-500 dark:text-indigo-400 pt-1">
          </div>
        <input 
            type="text" 
            ref="nameInput"
            v-model="misubRef.name" 
            @change="emit('change')"
            class="font-semibold text-lg text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none w-full truncate pt-0.5"
            placeholder="订阅名称"
            :readonly="!isEditing"
            @blur="isEditing = false"
        />
      </div>
      <div class="flex-shrink-0 flex flex-col items-end">
        <div class="text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full">
            {{ typeof nodeCount === 'number' ? `${nodeCount} nodes` : '...' }}
        </div>
        <div class="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button @click.stop="isEditing = true; nameInput.focus()" class="p-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="编辑名称">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
            </button>
            <button @click.stop="emit('delete')" class="p-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-red-500/20 text-red-500" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
      </div>
    </div>

    <div class="mt-2">
        <input
			type="text"
			v-model="misubRef.url"
            @input="handleUrlInput"
			class="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
			placeholder="http://, vmess://, hy2://..."
		/>
    </div>
  </div>
</template>