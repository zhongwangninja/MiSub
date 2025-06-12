<script>
    import { onMount } from 'svelte';
    import { toastStore } from '$stores';
    import { fly } from 'svelte/transition';

    let visible = false;
    let message = '';
    let type = 'success';

    toastStore.subscribe((value) => {
        if (value.message) {
            message = value.message;
            type = value.type || 'success';
            visible = true;
            setTimeout(() => {
                visible = false;
            }, 3000);
        }
    });
</script>

{#if visible}
    <div
        in:fly={{ y: -20, duration: 300 }}
        out:fly={{ y: -20, duration: 300 }}
        class="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-lg shadow-lg text-white font-semibold"
        class:bg-green-500={type === 'success'}
        class:bg-red-500={type === 'error'}
    >
        {message}
    </div>
{/if}