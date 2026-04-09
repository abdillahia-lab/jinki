// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';

// https://astro.build/config
export default defineConfig({
  site: 'https://jinki.ai',
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap(), compressor({ gzip: false, brotli: true })]
});