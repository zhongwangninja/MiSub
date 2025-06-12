<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fetchNodeCount } from '$api';
	import { extractNodeName } from '$lib/utils.js';
	import { fly } from 'svelte/transition';
	import Vmess from '$icons/Vmess.svelte';
	import Trojan from '$icons/Trojan.svelte';
	import Ss from '$icons/Ss.svelte';
	import Http from '$icons/Http.svelte';
	import Clash from '$icons/Clash.svelte';

	export let misub;

	let nodeCount = '...';
	let isEditing = misub.isNew || false;
	let nameInput;

	const dispatch = createEventDispatcher();

	onMount(() => {
		if (isEditing) {
			nameInput?.focus();
		}
		// 1. 组件加载时就尝试更新节点数和名称
		handleUrlChange(false); // 传入 false 表示不是用户手动触发的change
	});

	async function updateNodeCount() {
		if (misub.url && misub.url.startsWith('http')) {
			const data = await fetchNodeCount(misub.url);
			nodeCount = data.count;
			misub.nodeCount = typeof data.count === 'number' ? data.count : 0;
			dispatch('change');
		} else if (misub.url) {
			nodeCount = 1;
			misub.nodeCount = 1;
			dispatch('change');
		} else {
			nodeCount = 0;
			misub.nodeCount = 0;
			dispatch('change');
		}
	}

	function getProtocol(url) {
		try {
			if (!url) return 'unknown';
			const u = new URL(url);
			if (u.protocol.startsWith('http')) return 'http';
			return u.protocol.replace(':', '');
		} catch {
			return 'unknown';
		}
	}

	$: protocol = getProtocol(misub.url);

	// 2. 优化此函数，使其更可靠
	function handleUrlChange(isManualChange = true) {
		// 如果名称为空，或者这是一张新卡，就自动填充名称
		if (!misub.name || misub.isNew) {
			const extracted = extractNodeName(misub.url);
			if (extracted) {
				misub.name = extracted;
			}
		}
        // 如果是手动修改URL，将isNew标志设为false
        if (isManualChange) {
            misub.isNew = false;
        }

		updateNodeCount();
		dispatch('change');
	}
</script>

<div
	in:fly={{ y: 20, duration: 300 }}
	class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-4 transition-all duration-300 hover:shadow-lg hover:border-indigo-500/50 relative"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3 overflow-hidden">
			<input
				type="text"
				bind:this={nameInput}
				bind:value={misub.name}
				on:change={() => dispatch('change')}
				on:blur={() => (isEditing = false)}
				class="font-semibold text-lg text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none w-full truncate"
				placeholder="订阅名称"
			/>
		</div>
		</div>

	<div class="mt-3">
		<input
			type="text"
			bind:value={misub.url}
			on:input={() => handleUrlChange(true)} class="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
			placeholder="http:// 或 vmess://..."
		/>
	</div>
    </div>