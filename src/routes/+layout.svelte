<script>
  import "../app.css";
  import { theme } from '$stores';
  import Toast from '$lib/components/Toast.svelte';

  theme.init();
</script>

<div class={($theme === 'dark') ? 'dark' : ''}>
  <div class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors duration-300">
    <slot />
    <Toast />
  </div>
</div>