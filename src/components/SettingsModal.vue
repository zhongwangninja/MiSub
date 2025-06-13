<script setup>
import { ref, watch } from 'vue';
import { fetchSettings, saveSettings } from '../lib/api.js';
import { useToast } from '../lib/stores.js';

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['update:show']);

const { showToast } = useToast();
const settings = ref({});
const isLoading = ref(false);
const isSaving = ref(false);

watch(() => props.show, async (newValue) => {
    if (newValue) {
        isLoading.value = true;
        settings.value = await fetchSettings();
        isLoading.value = false;
    }
});

const handleSave = async () => {
    isSaving.value = true;
    // 只保存非空的字段，避免用空字符串覆盖已有值
    const settingsToSave = Object.fromEntries(
        Object.entries(settings.value).filter(([_, v]) => v !== '')
    );
    const result = await saveSettings(settingsToSave);
    if (result.success) {
        showToast('设置保存成功！', 'success');
        emit('update:show', false);
    } else {
        showToast(result.message || '保存失败', 'error');
    }
    isSaving.value = false;
};

</script>

<template>
  <Transition name="modal-fade">
    <div v-if="show" @click="emit('update:show', false)" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
      <div v-if="show" @click.stop class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg text-left ring-1 ring-black/5 dark:ring-white/10">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">系统设置</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">修改后的设置将在下次生成订阅链接时生效。</p>
        </div>
        
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div v-if="isLoading" class="text-center p-8">正在加载设置...</div>
          <form v-else class="space-y-6">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">订阅文件名 (FileName)</label>
              <input v-model="settings.FileName" type="text" placeholder="例如: MySubs" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">私有访问Token (mytoken)</label>
              <input v-model="settings.mytoken" type="text" placeholder="留空则使用环境变量" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram Bot Token</label>
              <input v-model="settings.BotToken" type="password" placeholder="输入你的机器人Token" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram Chat ID</label>
              <input v-model="settings.ChatID" type="text" placeholder="输入你的Chat ID" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">订阅转换后端地址 (subConverter)</label>
              <input v-model="settings.subConverter" type="text" placeholder="例如: api.v1.mk" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">远程配置文件 (subConfig)</label>
              <textarea v-model="settings.subConfig" rows="3" placeholder="输入远程配置 .ini 文件链接" class="mt-1 w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:ring-indigo-500"></textarea>
            </div>
          </form>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3 rounded-b-xl">
          <button @click="emit('update:show', false)" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-lg transition-colors">取消</button>
          <button @click="handleSave" :disabled="isSaving" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:bg-indigo-400">
            {{ isSaving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Modal Transition Styles */
</style>