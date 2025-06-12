<script>
	import { flip } from 'svelte/animate';
	import { fly, scale } from 'svelte/transition';
	import { saveMisubs } from '$api';
	import { extractNodeName } from '$lib/utils.js';
    import { toastStore } from '$stores';

	import Header from './Header.svelte';
	import Overview from './Overview.svelte';
	import Card from './Card.svelte';
	import Modal from './Modal.svelte';
	import BulkImportModal from './BulkImportModal.svelte';
    import RightPanel from './RightPanel.svelte';

    // 1. 接收从父组件传来的初始数据
	export let data;

    // 2.【关键修复】使用响应式语句 `$` 安全地初始化变量
    // 这可以确保在 `data` 从 null 变为有值时，misubs 和 config 会自动更新，从而避免程序崩溃
	$: misubs = (data?.misubs || []).map((s) => ({ ...s, id: crypto.randomUUID(), nodeCount: 0 }));
	$: config = data?.config || {};
    
	let isSaving = false;
	let subsDirty = false;
	let showDeleteAllModal = false;
	let showBulkImportModal = false;

    let currentPage = 1;
    const itemsPerPage = 9;

    $: paginatedMisubs = misubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    $: totalPages = Math.ceil(misubs.length / itemsPerPage);

	function handleDelete(event) {
		misubs = misubs.filter((s) => s.id !== event.detail.id);
		subsDirty = true;
        toastStore.show('已从列表移除，请点击保存', 'success');
	}

	function handleAdd() {
		misubs = [
			{ id: crypto.randomUUID(), name: '', url: '', enabled: true, isNew: true, nodeCount: 0 },
			...misubs
		];
        currentPage = 1;
        // 注意：新增后需要保存才会持久化
        toastStore.show('已添加新卡片，请填写并保存', 'success');
	}

	async function handleSave() {
		isSaving = true;
		const payload = misubs.map(({ id, nodeCount, isNew, ...rest }) => rest);
		const result = await saveMisubs(payload);
		if (result.success) {
            toastStore.show('保存成功！', 'success');
			subsDirty = false;
		} else {
            toastStore.show(result.message || '保存失败', 'error');
		}
		isSaving = false;
	}

	async function handleDeleteAll() {
		misubs = [];
		subsDirty = true;
        await handleSave(); // 调用保存函数以清空KV
		showDeleteAllModal = false;
	}

    function handleBulkImport(event) {
        const text = event.detail;
        if (!text) return;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const newSubs = lines.map(line => ({
            id: crypto.randomUUID(),
            name: extractNodeName(line) || '未命名节点',
            url: line,
            enabled: true,
            nodeCount: 0,
        }));

        misubs = [...newSubs, ...misubs];
        subsDirty = true;
        currentPage = 1;
        toastStore.show(`成功导入 ${lines.length} 条数据，请点击保存`, 'success');
    }

    function changePage(page) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
    }
</script>

<Header />

<main class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    {#if data}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" in:fly={{ y: 20, duration: 400, delay: 100 }}>
            <div class="lg:col-span-2 space-y-8">
                <Overview {misubs} />
                <div>
                    <div class="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-white/10 pb-4">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">我的订阅</h2>
                        <div class="flex items-center gap-2">
                            <button on:click={() => showDeleteAllModal = true} class="text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">清空所有</button>
                            <button on:click={() => showBulkImportModal = true} class="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-500/10 dark:hover:bg-white/10 transition-colors">批量导入</button>
                            <button on:click={handleAdd} class="text-sm font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">新增订阅</button>
                        </div>
                    </div>
    
                    {#if misubs.length > 0}
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {#each paginatedMisubs as misub (misub.id)}
                                <div animate:flip={{ duration: 300 }}>
                                    <Card
                                        bind:misub={misub}
                                        on:delete={handleDelete}
                                        on:change={() => (subsDirty = true)}
                                    />
                                </div>
                            {/each}
                        </div>
                        
                        {#if totalPages > 1}
                        <div class="flex justify-center items-center space-x-4 mt-8 text-sm font-medium">
                            <button on:click={() => changePage(currentPage - 1)} disabled={currentPage === 1} class="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">&laquo; 上一页</button>
                            <span class="text-gray-500 dark:text-gray-400">第 {currentPage} / {totalPages} 页</span>
                            <button on:click={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} class="px-3 py-1 rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">下一页 &raquo;</button>
                        </div>
                        {/if}
                    {:else}
                        <div class="text-center py-16 text-gray-500">
                            <p>暂无订阅，请点击右上角 "新增订阅" 添加一个。</p>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="lg:col-span-1">
                <RightPanel {config} />
            </div>
        </div>
	{/if}
</main>

{#if subsDirty}
    <div transition:scale={{duration: 300}} class="fixed bottom-8 right-8 z-50">
        <button on:click={handleSave} disabled={isSaving} class="px-5 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-all disabled:bg-green-800 disabled:cursor-not-allowed">
            {#if isSaving}
                <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>保存中...</span>
            {:else}
                 <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                <span>保存更改</span>
            {/if}
        </button>
    </div>
{/if}

<BulkImportModal bind:show={showBulkImportModal} on:import={handleBulkImport} />
<Modal bind:show={showDeleteAllModal} on:confirm={handleDeleteAll}>
    <h3 slot="title" class="text-lg font-bold text-red-500">确认清空</h3>
    <p slot="body" class="text-sm text-gray-400">您确定要删除所有订阅源吗？此操作将立即保存且无法恢复。</p>
</Modal>