<script>
    import { createEventDispatcher } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import Modal from '$components/Modal.svelte';

    export let show = false;
    let importText = '';

    const dispatch = createEventDispatcher();

    function handleConfirm() {
        dispatch('import', importText);
        show = false;
        importText = '';
    }
</script>

<Modal bind:show on:confirm={handleConfirm}>
    <h3 slot="title" class="text-lg font-bold text-gray-900 dark:text-white">批量导入</h3>
    <div slot="body">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            每行一个订阅链接或分享节点。将自动识别节点名称。
        </p>
        <textarea 
            bind:value={importText}
            rows="8"
            class="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            placeholder="vmess://...
http://...
trojan://..."
        ></textarea>
    </div>
</Modal>