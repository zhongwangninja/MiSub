import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        alias: {
            '$components': 'src/lib/components',
            '$icons': 'src/lib/icons',
            '$api': 'src/lib/api.js',
            '$stores': 'src/lib/stores.js',
            '$utils': 'src/lib/utils.js',
        }
    }
};

export default config;