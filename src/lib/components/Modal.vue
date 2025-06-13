<script setup>
const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['update:show', 'confirm']);
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4"
      @click="emit('update:show', false)"
    >
      <Transition name="modal-inner">
        <div
          v-if="show"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-left ring-1 ring-black/5 dark:ring-white/10"
          @click.stop
        >
          <div class="mb-4">
            <slot name="title">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">确认操作</h3>
            </slot>
          </div>
          <div class="mb-6">
            <slot name="body">
              <p class="text-sm text-gray-500 dark:text-gray-400">你确定要继续吗？</p>
            </slot>
          </div>
          <div class="flex justify-end space-x-3">
            <button @click="emit('update:show', false)" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-lg transition-colors">取消</button>
            <button @click="emit('confirm')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors">确认</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-inner-enter-active,
.modal-inner-leave-active {
  transition: all 0.25s ease;
}
.modal-inner-enter-from,
.modal-inner-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>