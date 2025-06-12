<script>
    import { onMount } from 'svelte';
    import Dashboard from '$lib/components/Dashboard.svelte';
    import Login from '$lib/components/Login.svelte';
    import { fetchInitialData } from '$api';

    let sessionState = 'loading';
    let initialData = null;

    onMount(async () => {
        await checkSession();
    });

    async function checkSession() {
        try {
            const data = await fetchInitialData();
            if (data) {
                initialData = data;
                sessionState = 'loggedIn';
            } else {
                sessionState = 'loggedOut';
            }
        } catch (e) {
            console.error("Fatal error during session check:", e);
            sessionState = 'loggedOut';
        }
    }

    function handleLoginSuccess() {
        window.location.reload();
    }
</script>

{#if sessionState === 'loading'}
    <div class="flex items-center justify-center min-h-screen">
        <p>正在加载...</p>
    </div>
{:else if sessionState === 'loggedIn'}
    <Dashboard data={initialData} />
{:else}
    <Login on:success={handleLoginSuccess} />
{/if}