<script>
    import { fly } from 'svelte/transition'; // <-- 确保这一行存在

	export let misubs = [];

	$: totalMisubs = misubs?.length || 0;
	$: enabledMisubs = misubs?.filter((s) => s.enabled).length || 0;
	$: totalNodes = misubs?.reduce((acc, sub) => acc + (sub.nodeCount || 0), 0) || 0;

	$: stats = [
		{ name: '总订阅数', value: totalMisubs },
		{ name: '已启用', value: enabledMisubs },
		{ name: '总节点数', value: totalNodes }
	];
</script>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
	{#each stats as stat}
		<div
			class="bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-sm border border-transparent dark:border-white/10"
		>
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
			<p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white transition-all duration-300">
                {#key stat.value}
                    <span in:fly={{ y: -10, duration: 250 }}>{stat.value}</span>
                {/key}
            </p>
		</div>
	{/each}
</div>