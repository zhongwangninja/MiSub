<script>
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import clsx from 'clsx';
    import { toastStore } from '$stores';

	export let config;

	let tabs = [
		{ id: 'sub', query: '', title: '通用' },
		{ id: 'b64', query: 'b64', title: 'Base64' },
		{ id: 'clash', query: 'clash', title: 'Clash' },
		{ id: 'sb', query: 'sb', title: 'Sing-Box' },
		{ id: 'surge', query: 'surge', title: 'Surge' }
	];

	let activeTab = 'sub';
    let baseUrl = '';

    onMount(() => {
        if (config.mytoken) {
            baseUrl = `${window.location.protocol}//${window.location.host}/sub?token=${config.mytoken}`;
        }
    });

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                toastStore.show('已复制到剪贴板！'); // 2. 使用 toastStore
            }).catch(err => {
                toastStore.show('复制失败: ' + err, 'error'); // 2. 使用 toastStore
            });
        } else {
            toastStore.show('浏览器不支持 Clipboard API', 'error'); // 2. 使用 toastStore
        }
    }
</script>

<div class="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-transparent dark:border-white/10 p-5 sticky top-24">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">订阅链接</h2>
    
    <div class="border-b border-gray-200 dark:border-white/10">
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            {#each tabs as tab}
                <button
                    on:click={() => activeTab = tab.id}
                    class={clsx(
                        "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.id 
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                >
                    {tab.title}
                </button>
            {/each}
        </nav>
    </div>

    <div class="mt-4 min-h-[68px]">
        {#if baseUrl}
            {#each tabs as tab}
                {#if activeTab === tab.id}
                    {@const finalUrl = `${baseUrl}${tab.query ? `&${tab.query}` : ''}`}
                    <div in:fly={{ y: 10, duration: 200 }}>
                        <div class="relative">
                            <input
                                type="text"
                                readonly
                                value={finalUrl}
                                class="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md px-3 py-2 pr-10 focus:outline-none font-mono"
                            />
                            <button 
                                on:click={() => copyToClipboard(finalUrl)}
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                                title="复制链接"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </button>
                        </div>
                    </div>
                {/if}
            {/each}
        {/if}
    </div>
</div>