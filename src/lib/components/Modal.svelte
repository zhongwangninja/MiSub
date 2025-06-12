<script>
    import { createEventDispatcher } from "svelte";
    import { fly, fade } from "svelte/transition";

    export let show = false;
    const dispatch = createEventDispatcher();
</script>

{#if show}
<div
    transition:fade={{ duration: 150 }}
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4"
    on:click={() => (show = false)}
>
    <div
        transition:fly={{ y: 20, duration: 200 }}
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-left ring-1 ring-black/5 dark:ring-white/10"
        on:click|stopPropagation
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
            <button
                on:click={() => (show = false)}
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-lg transition-colors"
            >
                取消
            </button>
            <button
                on:click={() => dispatch('confirm')}
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors"
            >
                确认
            </button>
        </div>
    </div>
</div>
{/if}