<script setup>
const defaultSettings = {
  FileName: 'MiSub',
  mytoken: 'auto',
  BotToken: '',
  ChatID: '',
  subConverter: 'subapi.cmliussss.com',
  subConfig: 'https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini'
};

const settings = ref({ ...defaultSettings });

watch(() => props.show, async (newValue) => {
    if (newValue) {
        isLoading.value = true;
        const remote = await fetchSettings();
        settings.value = { ...defaultSettings, ...(remote || {}) };
        isLoading.value = false;
    }
});

import { ref, watch } from 'vue';
import { fetchSettings, saveSettings } from '../lib/api.js';
import { useToast } from '../lib/stores.js';

const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['update:show']);
const { showToast } = useToast();
const isLoading = ref(false);
const isSaving = ref(false);

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
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg font-sans">
    <div class="bg-white dark:bg-[#23272f] rounded-2xl shadow-2xl w-full max-w-lg text-left ring-1 ring-black/5 dark:ring-white/10 p-8">
      <div class="text-2xl font-extrabold font-sans mb-6 text-gray-900 dark:text-white tracking-wide">系统设置</div>
      <form class="space-y-8">
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">订阅文件名 (FileName)</label>
          <input v-model="settings.FileName" type="text" placeholder="例如: MySubs"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition" />
        </div>
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">私有访问Token (mytoken)</label>
          <input v-model="settings.mytoken" type="text" placeholder="留空则使用环境变量"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition" />
        </div>
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">Telegram Bot Token</label>
          <input v-model="settings.BotToken" type="text" placeholder="输入你的机器人Token"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition" />
        </div>
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">Telegram Chat ID</label>
          <input v-model="settings.ChatID" type="text" placeholder="输入你的Chat ID"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition" />
        </div>
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">订阅转换后端地址 (subConverter)</label>
          <input v-model="settings.subConverter" type="text" placeholder="例如: api.v1.mk"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition" />
        </div>
        <div>
          <label class="block text-[15px] font-medium text-gray-600 dark:text-gray-300 mb-1 font-sans">远程配置文件 (subConfig)</label>
          <textarea v-model="settings.subConfig" rows="2" placeholder="输入远程配置 .ini 文件链接"
            class="w-full rounded-lg bg-gray-50 dark:bg-[#23272f] border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 text-gray-900 dark:text-gray-100 px-3 py-2 font-sans transition"></textarea>
        </div>
      </form>
      <div class="flex justify-end gap-3 mt-8">
        <button type="button"
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg transition-colors"
          @click="emit('update:show', false)">
          取消
        </button>
        <button type="button" :disabled="isSaving"
          class="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:bg-indigo-300"
          @click="handleSave">
          {{ isSaving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Transition Styles */
</style>